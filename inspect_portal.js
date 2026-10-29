import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PORTAL_URL = process.env.PORTAL_URL || 'https://trbsys.net/';
const USERNAME = process.env.PORTAL_USERNAME || 'Admin';
const PASSWORD = process.env.PORTAL_PASSWORD || 'Royal508501';
const HEADLESS = true;

const OUT_DIR = path.resolve('output', 'inspection');
mkdirSync(OUT_DIR, { recursive: true });
const SCREENSHOTS_DIR = path.join(OUT_DIR, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function login(page) {
  console.log('Navigating to login page:', PORTAL_URL);
  await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="user_name"]', USERNAME);
  await page.fill('input[name="user_password"]', PASSWORD);
  
  await Promise.all([
    page.waitForURL((url) => !/\/index\/?$/.test(url.pathname) && url.pathname !== '/', {
      timeout: 30000,
    }),
    page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")'),
  ]);
  console.log('Logged in successfully. Landed on:', page.url());
}

async function extractNavigation(page) {
  console.log('Extracting navigation links and menus...');
  const navData = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links.map(a => {
      const text = (a.innerText || a.textContent || '').trim();
      const href = a.getAttribute('href');
      const fullUrl = a.href;
      return { text, href, fullUrl };
    }).filter(item => {
      if (!item.href || item.href.startsWith('javascript:;') || item.href === '#') return false;
      // Filter out logout links to avoid ending session
      if (/logout/i.test(item.href) || /log.?out/i.test(item.text)) return false;
      return true;
    });
  });
  return navData;
}

async function inspectPage(page, url, label) {
  console.log(`\n--- Inspecting [${label}]: ${url} ---`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000); // Allow dynamic widgets/tables to populate

    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const heading = document.querySelector('h1, h2, h3, .page-title, .content-header')?.innerText?.trim() || '';

      // Extract all form inputs, selects, textareas (names, ids, labels, types)
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => {
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute('type') || (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text');
        const name = el.getAttribute('name') || '';
        const id = el.id || '';
        const placeholder = el.getAttribute('placeholder') || '';
        
        // Find associated label
        let labelText = '';
        if (id) {
          const lbl = document.querySelector(`label[for="${id}"]`);
          if (lbl) labelText = lbl.innerText.trim();
        }
        if (!labelText) {
          const parentLabel = el.closest('label');
          if (parentLabel) labelText = parentLabel.innerText.trim();
          else {
            const prev = el.previousElementSibling;
            if (prev && prev.tagName === 'LABEL') labelText = prev.innerText.trim();
          }
        }

        // If select, get options
        let options = [];
        if (tag === 'select') {
          options = Array.from(el.querySelectorAll('option')).map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
          })).slice(0, 30); // limit to 30 to keep concise
        }

        return { tag, type, name, id, label: labelText, placeholder, options };
      });

      // Extract table headers (columns)
      const tables = Array.from(document.querySelectorAll('table')).map((tbl, tblIdx) => {
        const headers = Array.from(tbl.querySelectorAll('th')).map(th => th.innerText.trim()).filter(Boolean);
        const sampleRow = Array.from(tbl.querySelectorAll('tbody tr')).slice(0, 3).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        );
        return {
          tableIndex: tblIdx + 1,
          headers,
          sampleRowCount: tbl.querySelectorAll('tbody tr').length,
          sampleRow
        };
      });

      // Extract buttons / actions (text and id/class)
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn')).map(btn => ({
        text: (btn.innerText || btn.value || '').trim(),
        id: btn.id,
        classes: btn.className,
      })).filter(b => b.text.length > 0);

      return {
        url: window.location.href,
        title,
        heading,
        inputsCount: inputs.length,
        inputs,
        tables,
        buttons
      };
    });

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${label.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    pageInfo.screenshot = screenshotPath;

    return pageInfo;
  } catch (err) {
    console.error(`Failed to inspect ${url}:`, err.message);
    return { url, label, error: err.message };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await login(page);
    const landingUrl = page.url();

    // 1. Inspect Landing Page (Dashboard / Home)
    const landingInfo = await inspectPage(page, landingUrl, 'landing_page');

    // 2. Discover navigation
    const navLinks = await extractNavigation(page);
    console.log(`Discovered ${navLinks.length} navigation links.`);

    // Deduplicate URLs and filter internal URLs only
    const visited = new Set();
    const uniqueRoutes = [];

    // Always include critical known routes
    const candidateUrls = [
      landingUrl,
      'https://trbsys.net/add-order',
      'https://trbsys.net/view-order',
      'https://trbsys.net/order-list',
      'https://trbsys.net/order-history',
      'https://trbsys.net/customer',
      'https://trbsys.net/reports',
      'https://trbsys.net/daily-report',
      'https://trbsys.net/class/class_select_sub_cate.php',
    ];

    for (const item of navLinks) {
      if (item.fullUrl && item.fullUrl.startsWith('https://trbsys.net/') && !item.fullUrl.includes('logout')) {
        candidateUrls.push(item.fullUrl);
      }
    }

    for (const rawUrl of candidateUrls) {
      const cleanUrl = rawUrl.split('#')[0];
      if (!visited.has(cleanUrl) && cleanUrl.startsWith('https://trbsys.net/')) {
        visited.add(cleanUrl);
        const linkItem = navLinks.find(n => n.fullUrl === rawUrl);
        const label = linkItem?.text || path.basename(cleanUrl) || 'page';
        uniqueRoutes.push({ url: cleanUrl, label });
      }
    }

    console.log('Unique routes to inspect safely:', uniqueRoutes.map(r => `${r.label} (${r.url})`));

    const inspectedPages = [landingInfo];

    // Inspect each unique route safely (Read-Only GET)
    for (const route of uniqueRoutes) {
      if (route.url === landingUrl) continue; // already inspected
      const info = await inspectPage(page, route.url, route.label);
      inspectedPages.push(info);
      await page.waitForTimeout(1000);
    }

    // Save full JSON report
    const reportPath = path.join(OUT_DIR, 'portal_structure_analysis.json');
    writeFileSync(reportPath, JSON.stringify({
      portalUrl: PORTAL_URL,
      inspectedAt: new Date().toISOString(),
      navigation: navLinks,
      pages: inspectedPages,
    }, null, 2));

    console.log(`\nInspection complete! Detailed report written to: ${reportPath}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
