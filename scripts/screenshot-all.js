const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle', timeout: 20000 });

  async function shot(name) {
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join('scripts/test-screenshots', name + '.png') });
    console.log('captured', name);
  }

  // Home
  await shot('01-home');

  // Dashboard
  await page.click('nav button:has-text("Intelligence Overview")');
  await shot('02-dashboard');

  // Growth / Strategy
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('g');
  await shot('03-growth');

  // Battlecards
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('b');
  await shot('04-battlecards');

  // Prompt Engine (Intelligence Method tab)
  await page.click('nav button:has-text("Growth Map")');
  await page.waitForTimeout(700);
  await page.click('button:has-text("Intelligence Method")');
  await shot('05-prompt-engine');

  // Audit Log
  await page.click('nav button:has-text("Intelligence Library")');
  await page.waitForTimeout(700);
  await page.click('button:has-text("Audit Log")');
  await shot('06-audit-log');

  // Decision Queue
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('d');
  await shot('07-decisions');

  await browser.close();
  console.log('done');
})();
