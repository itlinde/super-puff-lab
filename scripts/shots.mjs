// Renders the stage at given URL params and saves screenshots.
// Usage: node scripts/shots.mjs <baseUrl> <outDir> <name>=<query> ...
import { chromium } from 'playwright-core';
const [base, out, ...jobs] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
for (const job of jobs) {
  const i = job.indexOf('='); const name = job.slice(0, i); const q = job.slice(i + 1);
  await page.goto(`${base}/?${q ?? ''}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
await browser.close();
