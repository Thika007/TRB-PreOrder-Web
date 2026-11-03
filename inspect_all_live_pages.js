import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PORTAL_URL = 'https://trbsys.net/';
const USERNAME = 'Admin';
const PASSWORD = 'Royal508501';

const OUT_DIR = path.resolve('output', 'live_inspection');
mkdirSync(OUT_DIR, { recursive: true });
const SCREENSHOTS_DIR = path.join(OUT_DIR, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// The 19 exact functional routes extracted from console
const TARGET_ROUTES = [
  { name: 'Dashboard', url: 'https://trbsys.net/dashboard', menu: 'Dashboard' },
  { name: 'Create User', url: 'https://trbsys.net/create-users', menu: 'Main Access > System Users' },
  { name: 'Manage Users', url: 'https://trbsys.net/manage-users', menu: 'Main Access > System Users' },
  { name: 'Manage Product', url: 'https://trbsys.net/add-product', menu: 'Main Access > Manage Product' },
  { name: 'Main Categories', url: 'https://trbsys.net/manage-categories', menu: 'Main Access > Product Categories' },
  { name: 'Sub Categories', url: 'https://trbsys.net/manage-sub-categories', menu: 'Main Access > Product Categories' },
  { name: 'Customer List', url: 'https://trbsys.net/customer_list', menu: 'Main Access > Customer List' },
  { name: 'Orders (Create Order)', url: 'https://trbsys.net/add-order', menu: 'Orders' },
  { name: 'Manage Orders', url: 'https://trbsys.net/manage_orders', menu: 'Orders' },
  { name: 'Cancelled Orders', url: 'https://trbsys.net/cancel_orders', menu: 'Orders' },
  { name: 'Authorize Bills', url: 'https://trbsys.net/bill_authorized', menu: 'Orders' },
  { name: 'Chef Reports', url: 'https://trbsys.net/reports_cheff', menu: 'Chef Reports' },
  { name: 'All Report', url: 'https://trbsys.net/reports_all', menu: 'Reports > By Invoice' },
  { name: 'Overall Invoices', url: 'https://trbsys.net/overall-invoices', menu: 'Reports > By Invoice' },
  { name: 'All Product Sales', url: 'https://trbsys.net/reports_products_only', menu: 'Reports > By Product' },
  { name: 'Overall Product Sales', url: 'https://trbsys.net/reports-overall', menu: 'Reports > By Product' },
  { name: 'By Payment', url: 'https://trbsys.net/all-payment', menu: 'Reports > By Payment' },
  { name: 'SMS Promotions', url: 'https://trbsys.net/Promotions', menu: 'SMS Promotions' },
  { name: 'Delivery', url: 'https://trbsys.net/delivery', menu: 'Delivery' }
];

async function login(page) {
  console.log('Navigating to login:', PORTAL_URL);
  await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('input[name="user_name"]', USERNAME);
  await page.fill('input[name="user_password"]', PASSWORD);
  
  await Promise.all([
    page.waitForURL((url) => !/\/index\/?$/.test(url.pathname) && url.pathname !== '/', { timeout: 30000 }),
    page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")')
  ]);
  console.log('Login successful! Current URL:', page.url());
}

async function inspectRoute(page, item, index) {
  const filePrefix = `${String(index + 1).padStart(2, '0')}_${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  console.log(`\n[${index + 1}/${TARGET_ROUTES.length}] Inspecting: ${item.name} (${item.url})`);

  try {
    const startTime = Date.now();
    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // Brief pause for data tables or charts to render
    await page.waitForTimeout(2500);
    const loadTimeMs = Date.now() - startTime;

    const pageData = await page.evaluate(() => {
      const pageTitle = document.title;
      const heading = document.querySelector('h1, h2, h3, .page-title, .content-header')?.innerText?.trim() || '';
      const breadcrumbs = Array.from(document.querySelectorAll('.breadcrumb li, .breadcrumb a')).map(b => b.innerText.trim()).filter(Boolean);

      // 1. KPI Cards & Summary Blocks
      const kpis = Array.from(document.querySelectorAll('.info-box, .small-box, .card, .panel, .widget')).map(box => {
        const title = box.querySelector('.info-box-text, h3, h4, .title')?.innerText?.trim() || '';
        const value = box.querySelector('.info-box-number, .number, .value')?.innerText?.trim() || '';
        return title || value ? { title, value } : null;
      }).filter(Boolean);

      // 2. Form Inputs, Selects, Radios, Textareas
      const forms = Array.from(document.querySelectorAll('form')).map((form, fIdx) => {
        const formId = form.id;
        const formAction = form.action;
        const formMethod = form.method;
        return { fIdx, formId, formAction, formMethod };
      });

      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => {
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute('type') || (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text');
        const name = el.getAttribute('name') || '';
        const id = el.id || '';
        const placeholder = el.getAttribute('placeholder') || '';
        const value = el.value || '';
        const isRequired = el.hasAttribute('required');
        const isReadOnly = el.hasAttribute('readonly') || el.hasAttribute('disabled');

        // Look for associated label text
        let label = '';
        if (id) {
          const lEl = document.querySelector(`label[for="${id}"]`);
          if (lEl) label = lEl.innerText.trim();
        }
        if (!label) {
          const parentL = el.closest('label');
          if (parentL) label = parentL.innerText.trim();
          else {
            const prev = el.previousElementSibling;
            if (prev && prev.tagName === 'LABEL') label = prev.innerText.trim();
          }
        }

        // Extract select options if applicable
        let options = [];
        if (tag === 'select') {
          options = Array.from(el.querySelectorAll('option')).map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
            selected: opt.selected
          })).slice(0, 50); // first 50 options to avoid bloat
        }

        return { tag, type, name, id, label, placeholder, value, isRequired, isReadOnly, optionsCount: options.length, options };
      });

      // 3. Data Tables
      const tables = Array.from(document.querySelectorAll('table')).map((tbl, tIdx) => {
        const headers = Array.from(tbl.querySelectorAll('th')).map(th => th.innerText.trim()).filter(Boolean);
        const rows = Array.from(tbl.querySelectorAll('tbody tr'));
        const totalRows = rows.length;
        const sampleRows = rows.slice(0, 3).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        );

        return {
          tableIndex: tIdx + 1,
          tableId: tbl.id || '',
          tableClasses: tbl.className || '',
          headers,
          totalRows,
          sampleRows
        };
      });

      // 4. Action Buttons & Controls
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn')).map(btn => ({
        text: (btn.innerText || btn.value || '').trim(),
        id: btn.id || '',
        type: btn.getAttribute('type') || 'button',
        classes: btn.className || ''
      })).filter(b => b.text.length > 0);

      // 5. Modals detected in HTML
      const modals = Array.from(document.querySelectorAll('.modal, [role="dialog"]')).map(m => ({
        id: m.id || '',
        title: m.querySelector('.modal-title, h4, h5')?.innerText?.trim() || ''
      }));

      return {
        url: window.location.href,
        pageTitle,
        heading,
        breadcrumbs,
        formsCount: forms.length,
        forms,
        inputsCount: inputs.length,
        inputs,
        tablesCount: tables.length,
        tables,
        buttonsCount: buttons.length,
        buttons,
        modals
      };
    });

    // Capture Full Page Screenshot
    const screenshotName = `${filePrefix}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

    return {
      index: index + 1,
      name: item.name,
      menu: item.menu,
      targetUrl: item.url,
      loadTimeMs,
      screenshot: screenshotName,
      ...pageData
    };
  } catch (err) {
    console.error(`Error inspecting ${item.name}:`, err.message);
    return {
      index: index + 1,
      name: item.name,
      menu: item.menu,
      targetUrl: item.url,
      error: err.message
    };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await login(page);

    const results = [];
    for (let i = 0; i < TARGET_ROUTES.length; i++) {
      const item = TARGET_ROUTES[i];
      const pageResult = await inspectRoute(page, item, i);
      results.push(pageResult);
      await page.waitForTimeout(1000);
    }

    // Save complete JSON analysis
    const jsonPath = path.join(OUT_DIR, 'live_pages_structure.json');
    writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n========================================================`);
    console.log(`✅ Inspection Complete! All 19 pages analyzed.`);
    console.log(`📁 JSON Data: ${jsonPath}`);
    console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
    console.log(`========================================================`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

