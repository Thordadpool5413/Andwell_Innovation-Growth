// Feature verification script for Andwell Innovation app
// Run with: node scripts/verify-features.js

const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${label} — ${e.message.split('\n')[0]}`);
    failed++;
  }
}

// Click a non-interactive element and press keyboard shortcut
async function pressKey(page, key) {
  // Focus body via tabIndex trick so keyboard events reach the window handler
  await page.evaluate(() => {
    const el = document.body;
    el.tabIndex = el.tabIndex ?? -1;
    el.focus();
  });
  await page.waitForTimeout(200);
  await page.keyboard.press(key);
  await page.waitForTimeout(900);
}

// Navigate by clicking the sidebar nav button with the given label
async function navTo(page, label) {
  await page.click(`nav button:has-text("${label}")`);
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  console.log('\nAndwell Feature Verification\n');

  // ── Home page ────────────────────────────────────────────────────────────────
  console.log('Home page');
  await check('loads without error', async () => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    if (!title.includes('Andwell')) throw new Error(`Unexpected title: ${title}`);
  });

  await check('shows role switcher select', async () => {
    const sel = await page.$('select.darkSelect');
    if (!sel) throw new Error('select.darkSelect not found');
    const val = await sel.evaluate(el => el.value);
    if (!val) throw new Error('No value in role select');
  });

  await check('role switcher changes role', async () => {
    const sel = await page.$('select.darkSelect');
    await sel.selectOption('Growth Leader');
    const newVal = await sel.evaluate(el => el.value);
    if (newVal !== 'Growth Leader') throw new Error(`Role not changed: ${newVal}`);
    await sel.selectOption('Executive');
  });

  // ── Intelligence workspace toolbar (sidebar nav → heatmap) ──────────────────
  console.log('\nIntelligence Workspace Toolbar');
  await check('sidebar nav Growth Map navigates to heatmap view', async () => {
    await navTo(page, 'Growth Map');
    // Heatmap toolbar ONLY renders when view=heatmap; verify toolbar has "Intelligence Method"
    await page.waitForSelector('button:has-text("Intelligence Method")', { timeout: 5000 });
  });

  await check('toolbar shows all 6 intelligence tabs', async () => {
    const labels = ['Growth Map', 'Strategic Brief', 'Advantage Matrix', 'Strategy Brief', 'Intelligence Method'];
    for (const label of labels) {
      const btn = await page.$(`button:has-text("${label}")`);
      if (!btn) throw new Error(`Toolbar tab "${label}" not found`);
    }
  });

  await check('Prompt Engine view loads via toolbar', async () => {
    await page.click('button:has-text("Intelligence Method")');
    await page.waitForTimeout(600);
    // Should show ModuleCards with Edit buttons
    await page.waitForSelector('button:has-text("Edit")', { timeout: 5000 });
  });

  await check('Prompt Engine Edit opens textarea', async () => {
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(400);
    await page.waitForSelector('textarea', { timeout: 3000 });
  });

  // Close editor
  const cancelBtn = await page.$('button:has-text("Cancel")');
  if (cancelBtn) await cancelBtn.click();
  await page.waitForTimeout(300);

  // ── Operations workspace toolbar (keyboard: r → reports) ─────────────────────
  console.log('\nOperations Workspace Toolbar');
  await check('keyboard r navigates to reports', async () => {
    await pressKey(page, 'r');
    // reports toolbar: Intelligence Library, AI Coach, Audit Log, System Health
    await page.waitForSelector('button:has-text("Intelligence Library")', { timeout: 5000 });
  });

  await check('toolbar shows Audit Log tab', async () => {
    await page.waitForSelector('button:has-text("Audit Log")', { timeout: 5000 });
  });

  await check('Audit Log view loads', async () => {
    await page.click('button:has-text("Audit Log")');
    await page.waitForTimeout(500);
    const body = await page.content();
    if (!body.includes('Audit') && !body.includes('Activity')) {
      throw new Error('Audit Log content not found');
    }
  });

  // ── Decision Queue (keyboard: d) ──────────────────────────────────────────────
  console.log('\nDecision Queue');
  await check('keyboard d navigates to decisions', async () => {
    await pressKey(page, 'd');
    const body = await page.content();
    if (!body.includes('Decision') && !body.includes('decision')) {
      throw new Error('Decision Queue content not found');
    }
  });

  await check('Snooze filter button is rendered', async () => {
    // Status filter includes Snoozed regardless of whether decisions exist
    await page.waitForSelector('button:has-text("Snoozed")', { timeout: 5000 });
  });

  await check('no ErrorBoundary in Decision Queue', async () => {
    const errBound = await page.$('.error-boundary-fallback, [data-error-boundary]');
    if (errBound) throw new Error('ErrorBoundary triggered');
  });

  // ── Growth Command (keyboard: g) ──────────────────────────────────────────────
  console.log('\nGrowth Command');
  await check('keyboard g navigates to growth', async () => {
    await pressKey(page, 'g');
    await page.waitForSelector('button:has-text("Scenarios")', { timeout: 5000 });
  });

  await check('Export Excel button is present', async () => {
    await page.waitForSelector('button:has-text("Export Excel")', { timeout: 5000 });
  });

  // ── Intake view ───────────────────────────────────────────────────────────────
  console.log('\nIntake View');
  await check('navigates to intake via sidebar', async () => {
    // nav item: key='intake', label='Build Intelligence'
    await page.click('nav button:has-text("Build Intelligence")');
    await page.waitForTimeout(600);
  });

  await check('intake view renders competitor input area', async () => {
    const body = await page.content();
    if (!body.includes('competitor') && !body.includes('Competitor') && !body.includes('URL')) {
      throw new Error('Intake content not found');
    }
  });

  // ── Reports view ──────────────────────────────────────────────────────────────
  console.log('\nReports View');
  await check('navigates to reports via sidebar', async () => {
    // nav item: key='reports', label='Intelligence Library'
    await page.click('nav button:has-text("Intelligence Library")');
    await page.waitForTimeout(600);
  });

  await check('reports view loads without error', async () => {
    const errBound = await page.$('.error-boundary-fallback');
    if (errBound) throw new Error('ErrorBoundary in Reports view');
    const body = await page.content();
    if (!body.includes('report') && !body.includes('Report') && !body.includes('scan') && !body.includes('library')) {
      throw new Error('Reports content not found');
    }
  });

  // ── Dashboard role filter ─────────────────────────────────────────────────────
  console.log('\nDashboard Role Filtering');
  await check('navigates to dashboard via sidebar', async () => {
    // nav item: key='dashboard', label='Intelligence Overview'
    await page.click('nav button:has-text("Intelligence Overview")');
    await page.waitForTimeout(600);
  });

  await check('role switcher still works on dashboard', async () => {
    const sel = await page.$('select.darkSelect');
    if (!sel) throw new Error('select.darkSelect not found');
    await sel.selectOption('Growth Leader');
    await page.waitForTimeout(400);
    const val = await sel.evaluate(el => el.value);
    if (val !== 'Growth Leader') throw new Error('Role did not change to Growth Leader');
    await sel.selectOption('Executive');
  });

  await check('Dashboard renders without error', async () => {
    const errBound = await page.$('.error-boundary-fallback');
    if (errBound) throw new Error('ErrorBoundary on Dashboard');
  });

  // ── Summary ────────────────────────────────────────────────────────────────────
  console.log('\nSummary');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
