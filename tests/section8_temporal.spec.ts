import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('Section 9 - El Foco Temporal (Nostalgia vs. Futuro)', () => {
  test('should render gauges, diverging timeline, and handle scrolling and country filters', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => {
      if (!err.message.includes('ResizeObserver')) errors.push(err.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('ResizeObserver')) errors.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // 1. Scroll into Section 9
    await page.evaluate(() => document.querySelector('#scrolly-temporal')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);

    // 2. Canvas SVG should be visible
    const svg = page.locator('#d3-canvas-temporal svg');
    await expect(svg).toBeVisible();

    // 3. Four gauges rendered in 'ALL' mode
    const gauges = await page.locator('#d3-canvas-temporal .temporal-gauge-unit').count();
    expect(gauges).toBe(4);
    console.log(`Gauges rendered: ${gauges}`);

    // 4. Four needles present
    const needles = await page.locator('#d3-canvas-temporal .gauge-needle-group').count();
    expect(needles).toBe(4);

    // 5. Timeline elements rendered
    const zeroLine = await page.locator('#d3-canvas-temporal .timeline-zero-line').count();
    expect(zeroLine).toBe(1);

    const countryLines = await page.locator('#d3-canvas-temporal .temporal-line').count();
    expect(countryLines).toBe(4);

    const scrubber = await page.locator('#d3-canvas-temporal .temporal-scrubber-group').count();
    expect(scrubber).toBe(1);

    // 6. Active date badge shows date
    const dateBadge = await page.locator('#temporal-active-date-badge').innerText();
    expect(dateBadge.length).toBeGreaterThan(3);
    console.log(`Active date: ${dateBadge}`);

    // 7. Storytelling insight cards populated
    const esText = await page.locator('#temporal-insight-ES').innerText();
    expect(esText).toContain('España');

    const clText = await page.locator('#temporal-insight-CL').innerText();
    expect(clText).toContain('Chile');

    const arMxText = await page.locator('#temporal-insight-AR-MX').innerText();
    expect(arMxText).toContain('Argentina');

    const synthText = await page.locator('#temporal-insight-synthesis').innerText();
    expect(synthText).toContain('El péndulo del tiempo');

    // Screenshot Step 1
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'temporal-step1-desktop.png') });

    // 8. Test Step 2: Scroll to Spain step (2019-01)
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-temporal article .step');
      if (steps[1]) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1000);

    // In step 2, country filter sets to ES and date to 2019-01
    const activeBadgeStep2 = await page.locator('#temporal-active-date-badge').innerText();
    expect(activeBadgeStep2.toLowerCase()).toContain('2019');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'temporal-step2-espana.png') });

    // 9. Test Step 3: Scroll to Chile step (2020-10)
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-temporal article .step');
      if (steps[2]) steps[2].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1000);
    const activeBadgeStep3 = await page.locator('#temporal-active-date-badge').innerText();
    expect(activeBadgeStep3.toLowerCase()).toContain('2020');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'temporal-step3-chile.png') });

    // 10. Click country filter button 'Todos'
    await page.locator('.temporal-country-btn[data-country="ALL"]').click();
    await page.waitForTimeout(500);
    const gaugesAfterAll = await page.locator('#d3-canvas-temporal .temporal-gauge-unit').count();
    expect(gaugesAfterAll).toBe(4);

    // 11. Click 'Argentina' filter button
    await page.locator('.temporal-country-btn[data-country="AR"]').click();
    await page.waitForTimeout(500);
    const singleGauge = await page.locator('#d3-canvas-temporal .temporal-gauge-unit').count();
    expect(singleGauge).toBe(1);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'temporal-single-argentina.png') });

    // 12. Hover over timeline to test scrubber and tooltip
    await page.locator('.temporal-country-btn[data-country="ALL"]').click();
    await page.waitForTimeout(400);

    const overlay = page.locator('#d3-canvas-temporal .timeline-hover-overlay');
    await overlay.hover({ position: { x: 200, y: 50 } });
    await page.waitForTimeout(500);

    // Tooltip should be visible
    const tooltip = page.locator('.tooltip');
    await expect(tooltip).toBeVisible();

    // 13. Mobile viewport test
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.querySelector('#scrolly-temporal')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'temporal-mobile.png') });

    console.log('Total page errors captured:', errors.length, JSON.stringify(errors));
    expect(errors.length).toBe(0);
  });
});
