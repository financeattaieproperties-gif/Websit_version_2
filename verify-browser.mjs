import { chromium } from 'C:/Users/RoheenAhmadi/AppData/Local/Temp/pw-test/node_modules/playwright/index.mjs';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

const shots = [
  ['http://localhost:3000/', 'verify-home.png'],
  ['http://localhost:3000/contact', 'verify-contact.png'],
  ['http://localhost:3000/properties', 'verify-properties.png'],
];

for (const [url, file] of shots) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.screenshot({ path: file, fullPage: false });
  console.log(`${url} → ${file}`);
}

await browser.close();
