const { chromium } = require('C:\\Users\\RoheenAhmadi\\AppData\\Local\\Temp\\pw-test\\node_modules\\playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\RoheenAhmadi\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1223\\chrome-headless-shell-win64\\chrome-headless-shell.exe',
  });
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
    console.log(`${url} -> ${file} OK`);
  }

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
