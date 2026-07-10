import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.resolve('./tests/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('Section 6 - El Mapa del Poder (NER Bubble Map)', () => {
  
  test('should load the map, render land paths and bubbles, and handle country zoom transitions', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(4000); // Allow datasets to load in parallel

    // 1. Scroll to Section 6
    await page.evaluate(() => {
      document.getElementById('scrolly-map')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1500);

    // 2. Check SVG canvas is present
    const mapSvgExists = await page.locator('#d3-canvas-map svg').count();
    expect(mapSvgExists).toBe(1);

    // 3. Verify landmass paths are rendered
    const landPathsCount = await page.locator('#d3-canvas-map .map-land').count();
    expect(landPathsCount).toBeGreaterThan(100); // Should render standard world-110m countries
    console.log(`World countries paths rendered: ${landPathsCount}`);

    // 4. Verify highlighting of active countries (Argentina, Chile, Spain, Mexico)
    const activeCountriesCount = await page.locator('#d3-canvas-map .map-land.active-country').count();
    expect(activeCountriesCount).toBe(4);
    console.log(`Active countries highlighted on map: ${activeCountriesCount}`);

    // 5. Verify top 15 bubbles per country (up to 4 * 15 = 60 bubbles total)
    const bubblesCount = await page.locator('#d3-canvas-map .map-bubble').count();
    expect(bubblesCount).toBeGreaterThan(40); // Some might have invalid coordinates, but should be close to 60
    expect(bubblesCount).toBeLessThanOrEqual(60);
    console.log(`Deduplicated top-15 bubbles on map: ${bubblesCount}`);

    // 6. Check storytelling insights exist
    await expect(page.locator('#map-insight-CL')).not.toBeEmpty();
    await expect(page.locator('#map-insight-AR')).not.toBeEmpty();
    await expect(page.locator('#map-insight-MX')).not.toBeEmpty();

    const clText = await page.locator('#map-insight-CL').innerText();
    console.log(`Chile Insight: ${clText}`);

    // 7. Click Argentina zoom button
    await page.click('.map-country-btn[data-country="AR"]');
    await page.waitForTimeout(1200); // Wait for transition
    await expect(page.locator('.map-country-btn[data-country="AR"]')).toHaveClass(/active/);

    // 8. Click España zoom button
    await page.click('.map-country-btn[data-country="ES"]');
    await page.waitForTimeout(1200);
    await expect(page.locator('.map-country-btn[data-country="ES"]')).toHaveClass(/active/);

    // 9. Go back to overview "Todos"
    await page.click('.map-country-btn[data-country="all"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('.map-country-btn[data-country="all"]')).toHaveClass(/active/);

    // 10. Scroll through scrollytelling steps to trigger zoom states
    // Step 2: Chile Zoom
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-map article .step');
      if (steps[1]) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1500);
    await expect(page.locator('.map-country-btn[data-country="CL"]')).toHaveClass(/active/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06a-map-zoom-chile.png') });

    // Step 3: Argentina Zoom
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-map article .step');
      if (steps[2]) steps[2].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1500);
    await expect(page.locator('.map-country-btn[data-country="AR"]')).toHaveClass(/active/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06b-map-zoom-argentina.png') });

    // Step 4: Mexico Zoom
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-map article .step');
      if (steps[3]) steps[3].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1500);
    // Should start at Mexico (MX)
    await expect(page.locator('.map-country-btn[data-country="MX"]')).toHaveClass(/active/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06c-map-zoom-mexico.png') });

    expect(errors.length).toBe(0);
    console.log('✅ Section 6 fully tested without errors');
  });

});
