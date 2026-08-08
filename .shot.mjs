import { chromium } from 'playwright';

const OUT = process.env.SHOT_DIR;
const BASE = process.env.BASE_URL || 'http://localhost:3002';
const targets = JSON.parse(process.env.TARGETS || '[]');

const browser = await chromium.launch({ channel: 'chrome' });

for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.width || 1440, height: t.height || 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 120));
  });
  try {
    await page.goto(BASE + t.path, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${t.name}.png`, fullPage: !!t.full });
    console.log('ok  ', t.name, errors.length ? `| console errors: ${errors.length}` : '');
    errors.slice(0, 2).forEach((e) => console.log('       ', e));
  } catch (e) {
    console.log('FAIL', t.name, e.message.split('\n')[0]);
  }
  await page.close();
}

await browser.close();
