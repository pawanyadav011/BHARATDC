const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3000';

const roleCredentials = [
  { role: 'Super Admin', user: 'admin', pass: 'admin123', testModule: '/organizations', forbiddenModule: null },
  { role: 'Operations Manager', user: 'operations', pass: 'operations123', testModule: '/clients', forbiddenModule: '/users' },
  { role: 'Network Engineer', user: 'engineer', pass: 'engineer123', testModule: '/servers', forbiddenModule: '/organizations' },
  { role: 'Compliance Auditor', user: 'auditor', pass: 'auditor123', testModule: '/reports', forbiddenModule: '/server-allocation' },
  { role: 'Staff / Technician', user: 'staff', pass: 'staff123', testModule: '/maintenance', forbiddenModule: '/settings' }
];

async function testRoles() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1400,900']
  });

  for (const item of roleCredentials) {
    console.log(`\nTesting ${item.role} (${item.user})...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    try {
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle0' });

      // Fill in credentials
      await page.waitForSelector('#login-identifier-input', { timeout: 5000 });
      await page.type('#login-identifier-input', item.user);
      await page.type('#login-password-input', item.pass);
      await page.click('#login-submit-btn');

      await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 });
      console.log(`  ✓ Logged in as ${item.role} -> /dashboard`);

      // Test authorized module
      await page.goto(`${APP_URL}${item.testModule}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));
      const allowedText = await page.evaluate(() => document.body.innerText);
      if (allowedText.includes('Access Denied')) {
        throw new Error(`Forbidden from authorized module: ${item.testModule}`);
      }
      console.log(`  ✓ Accessed authorized module ${item.testModule}`);

      // Test forbidden module if applicable
      if (item.forbiddenModule) {
        await page.goto(`${APP_URL}${item.forbiddenModule}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 800));
        const forbiddenText = await page.evaluate(() => document.body.innerText);
        const isBlocked = forbiddenText.includes('Access Denied') || page.url().includes('access-denied');
        if (!isBlocked) {
          throw new Error(`RBAC failure: accessed forbidden module ${item.forbiddenModule}`);
        }
        console.log(`  ✓ Properly blocked from forbidden module ${item.forbiddenModule}`);
      }
    } catch (e) {
      console.error(`  ✗ Error testing ${item.role}:`, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

testRoles();
