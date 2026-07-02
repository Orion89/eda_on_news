import { test } from '@playwright/test';

test('capture errors emotions', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[BROWSER UNCAUGHT ERROR] ${err.name}: ${err.message}\nStack:\n${err.stack}`);
  });

  console.log('Navigating to http://127.0.0.1:8080...');
  await page.goto('http://127.0.0.1:8080');
  
  console.log('Waiting for visualizations to load...');
  await page.waitForTimeout(3000);
});
