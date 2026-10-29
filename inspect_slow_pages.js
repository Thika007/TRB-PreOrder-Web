import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PORTAL_URL = process.env.PORTAL_URL || 'https://trbsys.net/';
const USERNAME = process.env.PORTAL_USERNAME || 'Admin';
const PASSWORD = process.env.PORTAL_PASSWORD || 'Royal508501';

const OUT_DIR = path.resolve('output', 'inspection', 'slow_pages');
mkdirSync(OUT_DIR, { recursive: true });

async function inspectSinglePage(url, label) {
  console.log(`\nLaunching browser for: ${label} (${url})`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Login
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.fill('input[name="user_name"]', USERNAME);
    await page.fill('input[name="user_password"]', PASSWORD);
    await Promise.all([
      page.waitForURL((u) => !/\/index\/?$/.test(u.pathname) && u.pathname !== '/', { timeout: 45000 }),
      page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")'),
    ]);

    // 2. Navigate with 60s timeout
    console.log(`Navigating to ${url}...`);
    const start = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const loadTimeMs = Date.now() - start;
    console.log(`Loaded in ${loadTimeMs}ms!`);

    await page.waitForTimeout(2000);

    const info = await page.evaluate(() => {
      const title = document.title;
      const heading = document.querySelector('h1, h2, h3, .page-title, .content-header')?.innerText?.trim() || '';
      
      const tables = Array.from(document.querySelectorAll('table')).map((tbl, i) => ({
        tableIndex: i + 1,
        headers: Array.from(tbl.querySelectorAll('th')).map(th => th.innerText.trim()).filter(Boolean),
        rowCount: tbl.querySelectorAll('tbody tr').length,
        sampleRow: Array.from(tbl.querySelectorAll('tbody tr')).slice(0, 2).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        )
      }));

      const inputs = Array.from(document.querySelectorAll('input, select')).map(el => ({
        tag: el.tagName.toLowerCase(),
        name: el.getAttribute('name') || '',
        id: el.id || '',
        placeholder: el.getAttribute('placeholder') || '',
        options: el.tagName.toLowerCase() === 'select' ? Array.from(el.querySelectorAll('option')).slice(0, 10).map(o => o.textContent.trim()) : undefined
      }));

      return { title, heading, tables, inputsCount: inputs.length, inputs };
    });

    info.loadTimeMs = loadTimeMs;
    const shotPath = path.join(OUT_DIR, `${label}.png`);
    await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
    info.screenshot = shotPath;

    writeFileSync(path.join(OUT_DIR, `${label}.json`), JSON.stringify(info, null, 2));
    console.log(`Saved info for ${label}. Table count: ${info.tables.length}, loadTime: ${loadTimeMs}ms`);
    return info;
  } catch (err) {
    console.error(`Error loading ${label}:`, err.message);
    return { label, url, error: err.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  const targetPages = [
    { url: 'https://trbsys.net/manage_orders', label: 'manage_orders' },
    { url: 'https://trbsys.net/delivery', label: 'delivery' },
    { url: 'https://trbsys.net/bill_authorized', label: 'bill_authorized' },
    { url: 'https://trbsys.net/reports_cheff', label: 'reports_cheff' },
    { url: 'https://trbsys.net/customer_list', label: 'customer_list' }
  ];

  for (const p of targetPages) {
    await inspectSinglePage(p.url, p.label);
  }
}

main().catch(console.error);
