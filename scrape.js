import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import * as XLSX from 'xlsx';

const PORTAL_URL = process.env.PORTAL_URL || 'https://trbsys.net/';
const USERNAME = process.env.PORTAL_USERNAME;
const PASSWORD = process.env.PORTAL_PASSWORD;
const HEADLESS = (process.env.HEADLESS ?? 'true') !== 'false';
const OUTPUT_XLSX = process.env.OUTPUT_XLSX || path.join('output', 'products.xlsx');
const API = 'https://trbsys.net/class/class_select_sub_cate.php';

if (!USERNAME || !PASSWORD) {
  console.error('Missing PORTAL_USERNAME or PORTAL_PASSWORD in .env');
  process.exit(1);
}

function isPlaceholder(text) {
  const t = (text || '').trim().toLowerCase();
  return !t || t === 'select' || t.startsWith('select ') || t === 'no data available';
}

async function postJson(request, data) {
  const res = await request.post(API, {
    form: data,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  if (!res.ok()) {
    throw new Error(`API ${res.status()} for ${JSON.stringify(data)}`);
  }
  const text = (await res.text()).trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Non-JSON response for', data.paracall, text.slice(0, 120));
    return [];
  }
}

async function login(page) {
  await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="user_name"]', USERNAME);
  await page.fill('input[name="user_password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !/\/index\/?$/.test(url.pathname) && url.pathname !== '/', {
      timeout: 30000,
    }),
    page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")'),
  ]);
}

async function scrapeProducts(page) {
  await page.goto('https://trbsys.net/add-order', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#ord_p_m_typ');

  const mainTypes = await page.$$eval('#ord_p_m_typ option', (opts) =>
    opts
      .map((o) => ({ value: o.value, text: o.textContent.trim() }))
      .filter((o) => o.value && o.value !== '0')
  );

  const request = page.context().request;
  const rows = [];

  for (const main of mainTypes) {
    const subs = await postJson(request, {
      main_cate_id: main.value,
      paracall: 'load_subcat',
    });

    if (!subs.length) {
      console.log(`[${main.text}] no sub-categories`);
      continue;
    }

    for (const sub of subs) {
      const subId = sub.sub_id ?? sub.sub_name;
      const subName = sub.sub_name ?? String(subId);

      const products = await postJson(request, {
        product: subId,
        paracall: 'load_product',
      });

      if (!products.length) {
        console.log(`[${main.text} > ${subName}] no products`);
        continue;
      }

      for (const product of products) {
        const productId = product.auto_id;
        const productName = product.prd_name;

        if (!productId || isPlaceholder(productName)) continue;

        const priceRows = await postJson(request, {
          prd_price: productId,
          paracall: 'load_prd_price',
        });
        const priceInfo = priceRows[0] || {};
        const price = priceInfo.prd_price ?? '';

        const row = {
          mainProductType: main.text,
          subProductType: subName,
          product: productName,
          price: String(price),
          productId: String(productId),
        };
        rows.push(row);

        console.log(
          `${row.mainProductType} | ${row.subProductType} | ${row.product} | ${row.price}`
        );
      }
    }
  }

  return rows;
}

function saveExcel(rows, filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });

  const sheetRows = rows.map((r, i) => ({
    '#': i + 1,
    'Main-Product-Type': r.mainProductType,
    'Sub-Product-Type': r.subProductType,
    Product: r.product,
    Price: r.price,
    'Product ID': r.productId,
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 22 },
    { wch: 36 },
    { wch: 12 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, filePath);
  return path.resolve(filePath);
}

async function main() {
  console.log('Logging in to', PORTAL_URL);
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page);
    console.log('Logged in. Scraping Main → Sub → Product → Price...\n');
    console.log('Main-Product-Type | Sub-Product-Type | Product | Price');
    console.log('-'.repeat(72));

    const rows = await scrapeProducts(page);

    console.log('-'.repeat(72));
    console.log(`Total products: ${rows.length}`);

    const savedPath = saveExcel(rows, OUTPUT_XLSX);
    console.log(`Excel saved: ${savedPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\nScrape failed:', err.message);
  process.exit(1);
});
