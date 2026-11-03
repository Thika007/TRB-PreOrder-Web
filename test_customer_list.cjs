const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Logging in...');
  await page.goto('https://trbsys.net/', { timeout: 30000 });
  await page.fill('input[name="user_name"]', 'Admin');
  await page.fill('input[name="user_password"]', 'Royal508501');
  await page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")');
  await page.waitForTimeout(3000);
  console.log('Logged in to:', page.url());

  console.log('Navigating to /customer_list with 120s timeout...');
  const t0 = Date.now();
  try {
    await page.goto('https://trbsys.net/customer_list', { waitUntil: 'load', timeout: 120000 });
    console.log('Loaded in:', Date.now() - t0, 'ms. Title:', await page.title());
    const info = await page.evaluate(() => {
      return {
        title: document.title,
        heading: document.querySelector('h1, h2, h3, .page-title')?.innerText?.trim(),
        headers: Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim()),
        totalRows: document.querySelectorAll('tbody tr').length,
        inputsCount: document.querySelectorAll('input, select, textarea').length,
        buttons: Array.from(document.querySelectorAll('button, .btn')).map(b => b.innerText.trim()).filter(Boolean)
      };
    });
    console.log('Customer List info:', JSON.stringify(info, null, 2));
    await page.screenshot({ path: 'output/live_inspection/screenshots/07_Customer_List.png', fullPage: true });
    console.log('Screenshot saved.');
  } catch (e) {
    console.error('Error on customer_list:', e.message);
  }
  await browser.close();
})();

