import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('Volumen II - Sección 2: La regla de medir invisible (Arco de Proyección 1D)', () => {
  test('should render projection arc, transition across scrolly steps, and allow interactive exploration', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => {
      if (!err.message.includes('ResizeObserver')) errors.push(err.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('ResizeObserver')) errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/volumen-2.html`);
    await page.waitForTimeout(2000);

    // 1. Scroll into Section 2
    await page.evaluate(() => document.querySelector('#scrolly-projection')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.waitForTimeout(1200);

    // Verify SVG Canvas & Elements
    const svg = page.locator('#d3-canvas-projection svg');
    await expect(svg).toBeVisible();

    const baseline = page.locator('#d3-canvas-projection .arc-axis-line');
    await expect(baseline).toHaveCount(1);

    const arcPath = page.locator('#d3-canvas-projection .arc-path');
    await expect(arcPath).toHaveCount(1);

    const needles = page.locator('#d3-canvas-projection .arc-vector');
    await expect(needles).toHaveCount(4);

    const projLines = page.locator('#d3-canvas-projection .arc-proj-line');
    await expect(projLines).toHaveCount(4);

    const nodes = page.locator('#d3-canvas-projection .arc-node');
    await expect(nodes).toHaveCount(4);

    const markers = page.locator('#d3-canvas-projection .arc-proj-marker');
    await expect(markers).toHaveCount(4);

    // Initial step badges (Step 1: manifestante / moral)
    const activeBadge = page.locator('#projection-active-badge');
    await expect(activeBadge).toContainText('manifestante');

    const dimBadge = page.locator('#projection-dim-badge');
    await expect(dimBadge).toContainText('Moral');

    const polesBadge = page.locator('#projection-poles-badge');
    await expect(polesBadge).toContainText('Malo');
    await expect(polesBadge).toContainText('Bueno');

    // UI should be hidden in Step 1
    const interactiveUI = page.locator('#projection-interactive-ui');
    await expect(interactiveUI).not.toHaveClass(/is-visible/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec2_step1_manifestante.png') });

    // 2. Scroll into Step 2: carabineros
    await page.evaluate(() => document.querySelector('#step-proj-carabineros')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);
    await expect(activeBadge).toContainText('carabineros');
    await expect(interactiveUI).not.toHaveClass(/is-visible/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec2_step2_carabineros.png') });

    // 3. Scroll into Step 3: inmigrante (Nacionalismo)
    await page.evaluate(() => document.querySelector('#step-proj-inmigrante')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);
    await expect(activeBadge).toContainText('inmigrante');
    await expect(dimBadge).toContainText('Nacionalismo');
    await expect(polesBadge).toContainText('Extranjero');
    await expect(polesBadge).toContainText('Nacional');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec2_step3_inmigrante.png') });

    // 4. Scroll into Step 4: enfermería (Género)
    await page.evaluate(() => document.querySelector('#step-proj-enfermeria')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);
    await expect(activeBadge).toContainText('enfermería');
    await expect(dimBadge).toContainText('Género');
    await expect(polesBadge).toContainText('Femenino');
    await expect(polesBadge).toContainText('Masculino');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec2_step4_enfermeria.png') });

    // 5. Scroll into Step 5: Interactive Explorer
    await page.evaluate(() => document.querySelector('#step-proj-interactive')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1200);

    // Interactive UI should now be visible
    await expect(interactiveUI).toHaveClass(/is-visible/);

    const dimButtons = page.locator('#projection-dim-filters .filter-btn');
    await expect(dimButtons).toHaveCount(4);

    const wordPills = page.locator('#projection-word-pills .action-btn');
    const wordCount = await wordPills.count();
    expect(wordCount).toBeGreaterThan(5);

    // Click on "Tiempo y Cambio" dimension
    const timeBtn = page.locator('#projection-dim-filters .filter-btn', { hasText: 'Tiempo y Cambio' });
    await timeBtn.click();
    await page.waitForTimeout(800);
    await expect(dimBadge).toContainText('Tiempo y Cambio');
    await expect(polesBadge).toContainText('Futuro');
    await expect(polesBadge).toContainText('Pasado');

    // Click on "progreso" word pill
    const progresoPill = page.locator('#projection-word-pills .action-btn', { hasText: 'progreso' });
    await expect(progresoPill).toBeVisible();
    await progresoPill.click();
    await page.waitForTimeout(800);
    await expect(activeBadge).toContainText('progreso');
    await expect(progresoPill).toHaveClass(/action-btn-active/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec2_step5_interactive.png') });

    // 6. Test Tooltip on Node Hover (force: true prevents scroll-out of Step 5)
    const firstNode = page.locator('#d3-canvas-projection .arc-node').first();
    await firstNode.hover({ force: true });
    await page.waitForTimeout(400);
    const tooltip = page.locator('.tooltip');
    await expect(tooltip).toBeVisible();
    const tooltipContent = await tooltip.innerText();
    expect(tooltipContent).toContain('progreso');

    expect(errors).toEqual([]);
  });

  test('should render properly on mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/volumen-2.html`);
    await page.waitForTimeout(2000);

    // Scroll into Section 2
    await page.evaluate(() => document.querySelector('#scrolly-projection')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.waitForTimeout(1200);

    // Verify SVG and elements
    const svg = page.locator('#d3-canvas-projection svg');
    await expect(svg).toBeVisible();

    const needles = page.locator('#d3-canvas-projection .arc-vector');
    await expect(needles).toHaveCount(4);

    const nodes = page.locator('#d3-canvas-projection .arc-node');
    await expect(nodes).toHaveCount(4);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_mobile_projection.png') });
  });
});
