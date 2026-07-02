import { test, expect } from '@playwright/test';

test('Section 5 - Ridgeline Joyplot renders and emotion buttons work', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', err => {
    errors.push(`${err.name}: ${err.message}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
  });

  await page.goto('http://127.0.0.1:8080');
  await page.waitForTimeout(4000); // Wait for all data to load

  // 1. Scroll to Section 5
  await page.evaluate(() => {
    document.getElementById('scrolly-emotions')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1200);

  // 2. Check that the SVG canvas is rendered
  const svgExists = await page.locator('#d3-canvas-emotions svg').count();
  console.log(`SVG in #d3-canvas-emotions: ${svgExists}`);
  expect(svgExists).toBeGreaterThan(0);

  // 3. Check that area paths (mountains) exist
  const areaPaths = await page.locator('#d3-canvas-emotions .ridgeline-area').count();
  console.log(`Ridgeline area paths (mountains): ${areaPaths}`);
  expect(areaPaths).toBe(4); // One per country

  // 4. Check that stroke paths exist
  const strokePaths = await page.locator('#d3-canvas-emotions .ridgeline-stroke').count();
  console.log(`Ridgeline stroke paths: ${strokePaths}`);
  expect(strokePaths).toBe(4);

  // 5. Check baselines exist
  const baselines = await page.locator('#d3-canvas-emotions .ridgeline-baseline').count();
  console.log(`Baselines: ${baselines}`);
  expect(baselines).toBe(4);

  // 6. Check country labels exist
  const labels = await page.locator('#d3-canvas-emotions .ridgeline-country-label').count();
  console.log(`Country labels: ${labels}`);
  expect(labels).toBe(4);

  // 7. Test emotion button "Miedo"
  await page.click('.emotion-btn[data-emotion="miedo"]');
  await page.waitForTimeout(1000);
  const miedoBtnActive = await page.locator('.emotion-btn[data-emotion="miedo"].active').count();
  console.log(`"Miedo" button is active after click: ${miedoBtnActive}`);
  expect(miedoBtnActive).toBe(1);

  // 8. After click, areas should still be 4
  const areaPathsAfterClick = await page.locator('#d3-canvas-emotions .ridgeline-area').count();
  console.log(`Area paths after switching to Miedo: ${areaPathsAfterClick}`);
  expect(areaPathsAfterClick).toBe(4);

  // 9. Test "Ira" and "Tristeza" buttons as well
  await page.click('.emotion-btn[data-emotion="ira"]');
  await page.waitForTimeout(800);
  await page.click('.emotion-btn[data-emotion="tristeza"]');
  await page.waitForTimeout(800);
  await page.click('.emotion-btn[data-emotion="alegría"]');
  await page.waitForTimeout(800);

  // 10. Scroll to step 2 to trigger peak highlights
  await page.evaluate(() => {
    const steps = document.querySelectorAll('#scrolly-emotions article .step');
    if (steps.length > 1) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1500);

  const peakDots = await page.locator('#d3-canvas-emotions .peak-dot').count();
  console.log(`Peak dots shown in Step 2: ${peakDots}`);
  expect(peakDots).toBe(4);

  // 11. No errors
  console.log(`Total errors captured: ${errors.length}`);
  if (errors.length > 0) console.log('ERRORS:', errors.join('\n'));
  expect(errors.length).toBe(0);
});
