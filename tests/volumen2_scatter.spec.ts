import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('Volumen II - Sección 3: El Mapa Cartesiano (Cuadrantes 2D)', () => {
  test('should render 2D scatterplot, handle transitions across steps, and support interactive explorer', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => {
      if (!err.message.includes('ResizeObserver')) errors.push(err.message);
    });
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('ResizeObserver')) errors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/volumen-2.html`);
    await page.waitForTimeout(2000);

    // 1. Scroll into Section 3 (Step 1)
    await page.evaluate(() => document.querySelector('#step-scatter-moral-order')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1400);

    // Verify SVG Canvas & Elements
    const svg = page.locator('#d3-canvas-scatter svg');
    await expect(svg).toBeVisible();

    const quadrantLines = page.locator('#d3-canvas-scatter .quadrant-line');
    await expect(quadrantLines).toHaveCount(2);

    const quadrantLabels = page.locator('#d3-canvas-scatter .quadrant-label');
    await expect(quadrantLabels).toHaveCount(4);

    // In Step 1: 3 words ('manifestante', 'evasión', 'carabineros') * 4 countries = 12 dots
    const dots = page.locator('#d3-canvas-scatter .style-dot');
    await expect(dots).toHaveCount(12);

    const centroidLines = page.locator('#d3-canvas-scatter .centroid-line');
    await expect(centroidLines).toHaveCount(12);

    const centroidGroups = page.locator('#d3-canvas-scatter .centroid-group');
    await expect(centroidGroups).toHaveCount(3);

    // Verify badges for Step 1
    const activeBadge = page.locator('#scatter-active-badge');
    await expect(activeBadge).toContainText('manifestante');
    await expect(activeBadge).toContainText('evasión');
    await expect(activeBadge).toContainText('carabineros');

    const pairBadge = page.locator('#scatter-pair-badge');
    await expect(pairBadge).toContainText('Moral');
    await expect(pairBadge).toContainText('Orden y Legalidad');

    const polesXBadge = page.locator('#scatter-poles-x-badge');
    await expect(polesXBadge).toContainText('Malo');
    await expect(polesXBadge).toContainText('Bueno');

    const polesYBadge = page.locator('#scatter-poles-y-badge');
    await expect(polesYBadge).toContainText('Ilegalidad');
    await expect(polesYBadge).toContainText('Legalidad');

    // Interactive UI must NOT be visible in Step 1
    const interactiveUI = page.locator('#scatter-interactive-ui');
    await expect(interactiveUI).not.toHaveClass(/is-visible/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec3_step1_protesta.png') });

    // 2. Scroll into Step 2: political_ideology - affluence ('élite', 'universidad', 'sindicato')
    await page.evaluate(() => document.querySelector('#step-scatter-ideology-affluence')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1400);

    await expect(activeBadge).toContainText('élite');
    await expect(activeBadge).toContainText('universidad');
    await expect(activeBadge).toContainText('sindicato');
    await expect(pairBadge).toContainText('Ideología Política');
    await expect(polesXBadge).toContainText('Derecha');
    await expect(polesXBadge).toContainText('Izquierda');
    await expect(polesYBadge).toContainText('Pobreza');
    await expect(polesYBadge).toContainText('Riqueza');
    await expect(interactiveUI).not.toHaveClass(/is-visible/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec3_step2_ideology.png') });

    // 3. Scroll into Step 3: gender - affluence ('cuidados', 'enfermería', 'directorio')
    await page.evaluate(() => document.querySelector('#step-scatter-gender-affluence')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1400);

    await expect(activeBadge).toContainText('cuidados');
    await expect(activeBadge).toContainText('enfermería');
    await expect(activeBadge).toContainText('directorio');
    await expect(pairBadge).toContainText('Género');
    await expect(polesXBadge).toContainText('Femenino');
    await expect(polesXBadge).toContainText('Masculino');
    await expect(interactiveUI).not.toHaveClass(/is-visible/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec3_step3_gender.png') });

    // 4. Scroll into Step 4: Interactive Explorer
    await page.evaluate(() => document.querySelector('#step-scatter-interactive')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(1400);

    // Interactive UI must now be visible
    await expect(interactiveUI).toHaveClass(/is-visible/);

    // Word pills should be rendered with .action-btn
    const pills = page.locator('#scatter-word-pills .action-btn');
    const pillCount = await pills.count();
    expect(pillCount).toBeGreaterThanOrEqual(8);

    // Test clicking a pill to toggle word
    // Find an inactive pill
    const inactivePill = page.locator('#scatter-word-pills .action-btn:not(.action-btn-active)').first();
    const inactiveWord = await inactivePill.textContent();
    await inactivePill.click();
    await page.waitForTimeout(1200);

    // Now active badge should contain that added word
    if (inactiveWord) {
      await expect(activeBadge).toContainText(inactiveWord.trim());
    }

    // Test select change: Switch Dim X to moral
    const selectX = page.locator('#scatter-select-dim-x');
    await selectX.selectOption('moral');
    await page.waitForTimeout(1400);

    await expect(pairBadge).toContainText('Moral');
    await expect(polesXBadge).toContainText('Malo');

    // Test tooltip on .style-dot hover
    const firstDot = page.locator('#d3-canvas-scatter .style-dot').first();
    await firstDot.hover();
    await page.waitForTimeout(400);

    const tooltip = page.locator('.tooltip');
    await expect(tooltip).toBeVisible();
    const tooltipText = await tooltip.innerText();
    expect(tooltipText).toMatch(/Eje X/i);
    expect(tooltipText).toMatch(/Eje Y/i);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'vol2_sec3_step4_interactive.png') });

    expect(errors).toEqual([]);
  });
});
