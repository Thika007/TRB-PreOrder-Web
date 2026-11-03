const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Logging in...');
  await page.goto('https://trbsys.net/', { timeout: 30000 });
  await page.fill('input[name="user_name"]', 'Admin');
  await page.fill('input[name="user_password"]', 'Royal508501');
  await page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")');
  await page.waitForTimeout(3000);

  const targets = [
    { name: 'reports_products_only', url: 'https://trbsys.net/reports_products_only' },
    { name: 'reports-overall', url: 'https://trbsys.net/reports-overall' }
  ];

  for (const t of targets) {
    console.log(`Navigating to ${t.name}...`);
    try {
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      const data = await page.evaluate(() => {
        return {
          title: document.title,
          heading: document.querySelector('h1, h2, h3, .page-title, .content-header')?.innerText?.trim() || '',
          headers: Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim()).filter(Boolean),
          inputs: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
            name: el.name || el.id,
            type: el.type || el.tagName.toLowerCase(),
            placeholder: el.placeholder || '',
            value: el.value || '',
            label: el.closest('label')?.innerText?.trim() || ''
          })),
          sampleRows: Array.from(document.querySelectorAll('tbody tr')).slice(0, 2).map(r => 
            Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim())
          )
        };
      });
      console.log(`Results for ${t.name}:`, JSON.stringify({ heading: data.heading, headers: data.headers, inputsCount: data.inputs.length }, null, 2));
      fs.writeFileSync(`output/inspection/reports_pages/${t.name}.json`, JSON.stringify(data, null, 2));
      await page.screenshot({ path: `output/inspection/reports_pages/${t.name}.png`, fullPage: true });
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }

  await browser.close();
})();

