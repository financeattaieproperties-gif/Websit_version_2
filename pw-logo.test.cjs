const { test } = require('C:/Users/RoheenAhmadi/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/lib/index');
const fs = require('fs');

test('remove white bg', async ({ page }) => {
  await page.goto('about:blank');
  const result = await page.evaluate(async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej;
      img.src = 'http://localhost:5199/logo-raw.png';
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      if (r > 220 && g > 220 && b > 220) d[i+3] = 0;
    }
    ctx.putImageData(data, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync('public/logo.png', Buffer.from(result, 'base64'));
  console.log('logo.png written');
});
