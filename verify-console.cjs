const { chromium } = require('C:\\Users\\RoheenAhmadi\\AppData\\Local\\Temp\\pw-test\\node_modules\\playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\RoheenAhmadi\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1223\\chrome-headless-shell-win64\\chrome-headless-shell.exe',
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const pages = [
    'http://localhost:3000/',
    'http://localhost:3000/contact',
  ];

  for (const url of pages) {
    const errors = [];
    const warns = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warns.push(msg.text());
    });
    page.on('pageerror', err => errors.push('[pageerror] ' + err.message));

    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    console.log(`\n=== ${url} ===`);
    if (errors.length) {
      console.log('ERRORS:');
      errors.forEach(e => console.log('  ❌', e));
    } else {
      console.log('  ✅ No errors');
    }
    if (warns.length) {
      console.log('WARNS:');
      warns.forEach(w => console.log('  ⚠️ ', w));
    }
  }

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
