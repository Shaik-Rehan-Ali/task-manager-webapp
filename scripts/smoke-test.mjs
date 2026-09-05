// Functional smoke test: drives the built app in headless Chromium.
// Usage: node scripts/smoke-test.mjs <url>
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = process.argv[2] ?? 'http://127.0.0.1:4174';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CHROME =
  process.env.CHROME_PATH ??
  ['/bin/chromium-browser', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].find(
    (p) => p,
  );

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 420, height: 900, deviceScaleFactor: 2 },
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Initial empty state
  const bodyText = await page.evaluate(() => document.body.innerText);
  check('initial screen shows Daily Tasks + empty state', bodyText.includes('Daily Tasks') && bodyText.includes('No tasks yet'));

  // 2. Add a task
  await page.click('button.fab');
  await page.waitForSelector('.dialog');
  await page.type('input.input', 'Ship the v2 landing page');
  const textareas = await page.$$('textarea.input');
  await textareas[0].type('Write copy, add screenshots, deploy to Vercel');
  // pick HIGH priority (find the tile whose label is exactly "High")
  await page.evaluate(() => {
    const tile = [...document.querySelectorAll('.dialog .select-tile')].find((t) => t.textContent.trim() === 'High');
    if (tile) tile.click();
  });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.dialog-footer .btn')];
    const save = btns.find((b) => b.textContent.includes('Create task'));
    save.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Ship the v2 landing page'), { timeout: 5000 });
  check('task card appears after create', true);
  const cardText = await page.evaluate(() => document.body.innerText);
  check('task shows HIGH priority', cardText.includes('High'));

  // 3. Toggle completion
  await page.click('.task-checkbox');
  await page.waitForFunction(() => document.querySelector('.task-checkbox')?.classList.contains('checked'), { timeout: 3000 });
  check('completion toggle works', true);

  // 4. Persistence across reload
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('Ship the v2 landing page'), { timeout: 5000 });
  const afterReload = await page.evaluate(() => document.body.innerText);
  check('task persists after reload (IndexedDB)', afterReload.includes('Ship the v2 landing page'));

  // 5. Stats reflect completion
  check('daily progress shows 100%', afterReload.includes('100%') && afterReload.includes('1 of 1 tasks completed today'));

  // 6. Notes tab: create a note
  const navButtons = await page.$$('.nav-item');
  await navButtons[1].click();
  await page.waitForFunction(() => document.body.innerText.includes('No notes written yet'), { timeout: 3000 });
  await page.click('button.fab');
  await page.waitForSelector('.dialog');
  await page.type('input.input', 'Standup notes');
  const noteTextareas = await page.$$('textarea.input');
  await noteTextareas[0].type('Ship early, iterate fast.');
  // pin it
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.dialog .icon-btn')].find((b) => b.getAttribute('title') === 'Pin');
    btn.click();
  });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.dialog-footer .btn')];
    const save = btns.find((b) => b.textContent.includes('Save Note'));
    save.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Standup notes'), { timeout: 5000 });
  const notesText = await page.evaluate(() => document.body.innerText);
  check('note created and shown', true);
  check('note pinned badge visible', notesText.includes('PINNED'));

  // 7. Analysis tab renders stats
  await navButtons[3].click();
  await page.waitForFunction(() => document.body.innerText.includes('Analysis & Insights'), { timeout: 3000 });
  const analysisText = await page.evaluate(() => document.body.innerText);
  check(
    'analysis shows 100% today + notes written',
    analysisText.includes("Today's Progress") && analysisText.includes('Notes Written'),
  );

  // 8. Settings tab renders
  await navButtons[2].click();
  await page.waitForFunction(() => document.body.innerText.includes('Theme & Appearance'), { timeout: 3000 });
  const settingsText = await page.evaluate(() => document.body.innerText);
  check('settings shows theme options + offline badge', settingsText.includes('Dark') && settingsText.includes('100% Offline'));

  // Screenshots for visual reference
  await mkdir(path.join(root, 'docs', 'screenshots'), { recursive: true });
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  await navButtons[0].click();
  await delay(600);
  await page.screenshot({ path: path.join(root, 'docs', 'screenshots', 'tasks.png') });
  await navButtons[1].click();
  await delay(600);
  await page.screenshot({ path: path.join(root, 'docs', 'screenshots', 'notes.png') });
  await navButtons[3].click();
  await delay(600);
  await page.screenshot({ path: path.join(root, 'docs', 'screenshots', 'analysis.png') });
  await navButtons[2].click();
  await delay(600);
  await page.screenshot({ path: path.join(root, 'docs', 'screenshots', 'settings.png') });
  console.log('screenshots -> docs/screenshots/');
} catch (err) {
  console.error('SMOKE TEST CRASHED:', err);
  results.push({ name: 'script completed without crash', ok: false });
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);