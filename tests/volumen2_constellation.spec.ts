import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('Volumen II - La Geometría de la Cultura (Mapa de Constelaciones)', () => {
  test('should navigate between Vol. I and Vol. II via hero navigation links', async ({ page }) => {
    // Start at Index (Vol. I)
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(1000);

    const navVol2 = page.locator('.volume-link[href="volumen-2.html"]');
    await expect(navVol2).toBeVisible();
    await navVol2.click();

    await expect(page).toHaveURL(`${BASE_URL}/volumen-2.html`);
    await expect(page.locator('h1.hero-title')).toContainText('La Geometría de la Cultura');

    // Return to Vol. I
    const navVol1 = page.locator('.volume-link[href="index.html"]');
    await expect(navVol1).toBeVisible();
    await navVol1.click();

    await expect(page).toHaveURL(`${BASE_URL}/index.html`);
  });

  test('should render constellation network and handle scrolly steps and interactive filters', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => {
      if (!err.message.includes('ResizeObserver')) errors.push(err.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('ResizeObserver')) errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/volumen-2.html`);
    await page.waitForTimeout(2000);

    // 1. Check Section divider and layout
    const divider = page.locator('.section-divider');
    await expect(divider).toBeVisible();
    await expect(divider).toContainText('Sección 1');

    // 2. SVG Canvas should be rendered
    const svg = page.locator('#d3-canvas-constellation svg');
    await expect(svg).toBeVisible();

    // 3. Exactly 4 nodes and 6 links (combination of 4 choose 2)
    const nodes = page.locator('#d3-canvas-constellation .node-group');
    await expect(nodes).toHaveCount(4);

    const links = page.locator('#d3-canvas-constellation .constellation-link');
    await expect(links).toHaveCount(6);

    const linkLabels = page.locator('#d3-canvas-constellation .constellation-link-label');
    await expect(linkLabels).toHaveCount(6);

    // Initial dimension should be moral
    const badge = page.locator('#constellation-active-dim-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Moral');

    // Scroll into constellation visualization
    await page.evaluate(() => document.querySelector('#scrolly-constellation')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1200);

    // Capture initial desktop screenshot (Moral)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec1_step1_moral.png') });

    // 4. Scroll into Step 2 (Edad)
    await page.evaluate(() => document.querySelector('#step-age')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);
    await expect(badge).toContainText('Edad');

    // 5. Scroll into Step 3 (Nacionalismo)
    await page.evaluate(() => document.querySelector('#step-nationalism')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);
    await expect(badge).toContainText('Nacionalismo');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec1_step3_nationalism.png') });

    // 6. Scroll into Step 4 (Interactivo)
    await page.evaluate(() => document.querySelector('#step-interactive')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);

    // Verify 9 dimension filter buttons are present
    const filterButtons = page.locator('#constellation-filter-buttons .filter-btn');
    await expect(filterButtons).toHaveCount(9);

    // Click on "Ideología Política"
    const polBtn = page.locator('#constellation-filter-buttons .filter-btn', { hasText: 'Ideología Política' });
    await polBtn.click();
    await page.waitForTimeout(800);
    await expect(badge).toContainText('Ideología Política');
    await expect(polBtn).toHaveClass(/filter-btn-active/);

    // Click on "Tiempo y Cambio"
    const timeBtn = page.locator('#constellation-filter-buttons .filter-btn', { hasText: 'Tiempo y Cambio' });
    await timeBtn.click();
    await page.waitForTimeout(800);
    await expect(badge).toContainText('Tiempo y Cambio');
    await expect(timeBtn).toHaveClass(/filter-btn-active/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec1_step4_interactive.png') });

    // 7. Verify Tooltip on Node Hover
    const firstNode = nodes.first();
    await firstNode.hover();
    await page.waitForTimeout(400);
    const tooltip = page.locator('.tooltip');
    await expect(tooltip).toBeVisible();
    const tooltipText = await tooltip.innerText();
    expect(tooltipText.length).toBeGreaterThan(5);

    expect(errors).toEqual([]);
  });

  test('should render properly on mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/volumen-2.html`);
    await page.waitForTimeout(2000);

    // Verify hero and volume nav
    await expect(page.locator('.volume-nav')).toBeVisible();
    await expect(page.locator('h1.hero-title')).toBeVisible();

    // Verify constellation canvas
    const svg = page.locator('#d3-canvas-constellation svg');
    await expect(svg).toBeVisible();

    const nodes = page.locator('#d3-canvas-constellation .node-group');
    await expect(nodes).toHaveCount(4);

    await page.evaluate(() => document.querySelector('#scrolly-constellation')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_mobile_constellation.png') });
  });
});
