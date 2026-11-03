import { chromium } from 'playwright';

const PORTAL_URL = 'https://trbsys.net/';
const USERNAME = 'Admin';
const PASSWORD = 'Royal508501';

async function testLogin() {
  console.log('Testing connection to', PORTAL_URL);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Landed on:', page.url(), '| Title:', await page.title());
    
    // Check if on login page
    const userInput = await page.$('input[name="user_name"]');
    if (userInput) {
      console.log('Filling credentials...');
      await page.fill('input[name="user_name"]', USERNAME);
      await page.fill('input[name="user_password"]', PASSWORD);
      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }),
        page.click('button:has-text("Log In"), input[type="submit"], .btn:has-text("Log In")')
      ]);
      console.log('Login successful! Landed on:', page.url());
    } else {
      console.log('Current page URL:', page.url());
    }
  } catch (err) {
    console.error('Error during test login:', err.message);
  } finally {
    await browser.close();
  }
}

testLogin();

