import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PORTAL_URL = process.env.PORTAL_URL || 'https://trbsys.net/';
const USERNAME = process.env.PORTAL_USERNAME || 'Admin';
const PASSWORD = process.env.PORTAL_PASSWORD || 'Royal508501';

const OUT_DIR = path.resolve('output', 'inspection', 'reports_pages');
mkdirSync(OUT_DIR, { recursive: true });

async function inspectPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.fill('input[name="user_name"]', USERNAME);
  await page.fill('input[name="user_password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !/\/index\/?$/.test(u.pathname) && u.pathname !== '/', { timeout: 45000 }),
    page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")'),
  ]);

  const pagesToVisit = [
    { url: 'https://trbsys.net/cancel_orders', label: 'cancel_orders' },
    { url: 'https://trbsys.net/reports_all', label: 'reports_all' },
    { url: 'https://trbsys.net/overall-invoices', label: 'overall_invoices' },
    { url: 'https://trbsys.net/reports_products_only', label: 'reports_products_only' },
    { url: 'https://trbsys.net/reports-overall', label: 'reports_overall' },
    { url: 'https://trbsys.net/all-payment', label: 'all_payment' },
    { url: 'https://trbsys.net/Promotions', label: 'promotions' }
  ];

  for (const item of pagesToVisit) {
    try {
      console.log(`Navigating to ${item.label}...`);
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1500);

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
          placeholder: el.getAttribute('placeholder') || ''
        }));
        return { title, heading, tables, inputsCount: inputs.length, inputs };
      });

      const shotPath = path.join(OUT_DIR, `${item.label}.png`);
      await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
      info.screenshot = shotPath;
      writeFileSync(path.join(OUT_DIR, `${item.label}.json`), JSON.stringify(info, null, 2));
      console.log(`Successfully captured ${item.label}.`);
    } catch (err) {
      console.error(`Failed ${item.label}:`, err.message);
    }
  }

  await browser.close();
}

inspectPages().catch(console.error);
