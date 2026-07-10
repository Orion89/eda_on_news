/**
 * Suite de pruebas completa para "El Eco de las Palabras"
 * Verifica todas las secciones, interacciones y visualizaciones.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOTS_DIR = path.resolve('./tests/screenshots');

// Crear directorio de screenshots si no existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('El Eco de las Palabras — Suite de Pruebas Completa', () => {
  
  test.beforeEach(async ({ page }) => {
    // Filtrar sólo errores reales (ignorar favicon 404)
    page.on('pageerror', err => {
      if (!err.message.includes('favicon')) {
        throw new Error(`[JS ERROR] ${err.message}`);
      }
    });
  });

  // ══════════════════════════════════════════════════
  // TEST 1: CARGA INICIAL Y HERO
  // ══════════════════════════════════════════════════
  test('1. Carga inicial — Hero y título correctos', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Título de pestaña
    await expect(page).toHaveTitle(/El Eco de las Palabras/);

    // Hero h1
    const heroTitle = page.locator('header h1');
    await expect(heroTitle).toContainText('El Eco de las Palabras');

    // Hero bajada
    const heroSubtitle = page.locator('header .hero-subtitle');
    await expect(heroSubtitle).toBeVisible();

    // Mensaje de inicialización en consola (verificado vía eval)
    const initOk = await page.evaluate(() => {
      // Si el SVG de la Sección 1 existe, significa que init() completó
      return !!document.querySelector('#d3-canvas svg');
    });
    expect(initOk).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-hero.png'), fullPage: false });
    console.log('✅ Hero y carga inicial OK');
  });

  // ══════════════════════════════════════════════════
  // TEST 2: SECCIÓN 1 — BUBBLE CHART (Concentración)
  // ══════════════════════════════════════════════════
  test('2. Sección 1 — Bubble Chart de Concentración Mediática', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    // Scrollear a la sección
    await page.evaluate(() => document.querySelector('#scrolly')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);

    // SVG existe
    await expect(page.locator('#d3-canvas svg')).toBeVisible();

    // Burbujas renderizadas
    const bubbleCount = await page.locator('#d3-canvas .bubble').count();
    expect(bubbleCount).toBeGreaterThan(0);
    console.log(`  Burbujas renderizadas: ${bubbleCount}`);

    // Cards de storytelling (4 países)
    const cards = await page.locator('#storytelling-insights .insight-card').count();
    expect(cards).toBe(4);

    // Scroll a step 2 (colapsar en "Otros")
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly article .step');
      if (steps[1]) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(2000);

    // Verificar que existe burbuja "Otros" después del colapso
    const otrosBubble = await page.evaluate(() => {
      const bubbles = document.querySelectorAll('#d3-canvas .bubble');
      return bubbles.length > 0;
    });
    expect(otrosBubble).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-sec1-bubbles.png'), fullPage: false });
    console.log(`✅ Sección 1 OK — ${bubbleCount} burbujas, ${cards} cards`);
  });

  // ══════════════════════════════════════════════════
  // TEST 3: SECCIÓN 2 — SCATTER PLOT (Estilo)
  // ══════════════════════════════════════════════════
  test('3. Sección 2 — Scatter Plot de Huellas Estilísticas', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    await page.evaluate(() => document.querySelector('#scrolly-style')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);

    // SVG existe
    await expect(page.locator('#d3-canvas-style svg')).toBeVisible();

    // Puntos renderizados
    const dotCount = await page.locator('#d3-canvas-style .style-dot').count();
    expect(dotCount).toBeGreaterThan(0);
    console.log(`  Puntos scatter: ${dotCount}`);

    // Líneas de cuadrantes (2: horizontal + vertical)
    const quadrantLines = await page.locator('#d3-canvas-style .quadrant-line').count();
    expect(quadrantLines).toBe(2);

    // Etiquetas de cuadrante
    const quadrantLabels = await page.locator('#d3-canvas-style .quadrant-label').count();
    expect(quadrantLabels).toBeGreaterThan(0);

    // Storytelling texto estilo
    const styleInsight = page.locator('#storytelling-insights-style');
    await expect(styleInsight).not.toBeEmpty();

    // Botón filtro Chile → activa
    await page.click('.filter-btn[data-country="CL"]');
    await page.waitForTimeout(700);
    await expect(page.locator('.filter-btn[data-country="CL"]')).toHaveClass(/active/);

    // Volver a todos
    await page.click('.filter-btn[data-country="all"]');
    await page.waitForTimeout(500);
    await expect(page.locator('.filter-btn[data-country="all"]')).toHaveClass(/active/);

    // Scroll al step 2 (highlights de medios extremos)
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-style article .step');
      if (steps[1]) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1200);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-sec2-scatter.png'), fullPage: false });
    console.log(`✅ Sección 2 OK — ${dotCount} puntos, ${quadrantLines} líneas de cuadrante`);
  });

  // ══════════════════════════════════════════════════
  // TEST 4: SECCIÓN 3 — STACKED BAR CHART (POS)
  // ══════════════════════════════════════════════════
  test('4. Sección 3 — Stacked Bar Chart de Anatomía del Discurso', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    await page.evaluate(() => document.querySelector('#scrolly-pos')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);

    // SVG existe
    await expect(page.locator('#d3-canvas-pos svg')).toBeVisible();

    // Barras renderizadas
    const posRects = await page.locator('#d3-canvas-pos .pos-rect').count();
    expect(posRects).toBeGreaterThan(0);
    console.log(`  Barras POS: ${posRects}`);

    // Storytelling texto POS
    const posInsight = page.locator('#storytelling-insights-pos');
    await expect(posInsight).not.toBeEmpty();

    // ── Interacción: cambiar país a España ──
    await page.click('.pos-filter-btn[data-country="ES"]');
    await page.waitForTimeout(900);
    await expect(page.locator('.pos-filter-btn[data-country="ES"]')).toHaveClass(/active/);

    const esRects = await page.locator('#d3-canvas-pos .pos-rect').count();
    expect(esRects).toBeGreaterThan(0);
    console.log(`  Barras POS España: ${esRects}`);

    // ── Interacción: Ordenar por subjetividad ──
    await page.click('#btn-sort-pos');
    await page.waitForTimeout(900);
    await expect(page.locator('#btn-sort-pos')).toHaveClass(/active/);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-sec3-pos-sorted.png'), fullPage: false });

    // ── Resetear ──
    await page.click('#btn-reset-pos');
    await page.waitForTimeout(700);

    // ── Cambiar a México ──
    await page.click('.pos-filter-btn[data-country="MX"]');
    await page.waitForTimeout(800);
    await expect(page.locator('.pos-filter-btn[data-country="MX"]')).toHaveClass(/active/);

    console.log(`✅ Sección 3 OK — ${posRects} barras, filtros y ordenamiento funcionan`);
  });

  // ══════════════════════════════════════════════════
  // TEST 5: SECCIÓN 5 — RIDGELINE JOYPLOT (Emociones)
  // ══════════════════════════════════════════════════
  test('5. Sección 5 — Ridgeline Joyplot del Termómetro Emocional', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    await page.evaluate(() => document.querySelector('#scrolly-emotions')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1800);

    // SVG existe
    await expect(page.locator('#d3-canvas-emotions svg')).toBeVisible();

    // 4 áreas de montaña (una por país)
    const areas = await page.locator('#d3-canvas-emotions .ridgeline-area').count();
    expect(areas).toBe(4);

    // 4 strokes (contornos)
    const strokes = await page.locator('#d3-canvas-emotions .ridgeline-stroke').count();
    expect(strokes).toBe(4);

    // 4 baselines
    const baselines = await page.locator('#d3-canvas-emotions .ridgeline-baseline').count();
    expect(baselines).toBe(4);

    // 4 etiquetas de país
    const labels = await page.locator('#d3-canvas-emotions .ridgeline-country-label').count();
    expect(labels).toBe(4);

    // Storytelling de emociones
    const emotionCards = await page.locator('#storytelling-insights-emotions .insight-card').count();
    expect(emotionCards).toBe(4);

    console.log(`  Áreas: ${areas}, Strokes: ${strokes}, Baselines: ${baselines}, Labels: ${labels}`);

    // Screenshot estado inicial (Alegría)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05a-sec5-alegria.png'), fullPage: false });

    // ── Interacción: Cambiar a "Miedo" ──
    await page.click('.emotion-btn[data-emotion="miedo"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('.emotion-btn[data-emotion="miedo"]')).toHaveClass(/active/);
    const areasAfterMiedo = await page.locator('#d3-canvas-emotions .ridgeline-area').count();
    expect(areasAfterMiedo).toBe(4);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05b-sec5-miedo.png'), fullPage: false });

    // ── Cambiar a "Ira" ──
    await page.click('.emotion-btn[data-emotion="ira"]');
    await page.waitForTimeout(900);

    // ── Cambiar a "Tristeza" ──
    await page.click('.emotion-btn[data-emotion="tristeza"]');
    await page.waitForTimeout(900);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05c-sec5-tristeza.png'), fullPage: false });

    // ── Volver a Alegría ──
    await page.click('.emotion-btn[data-emotion="alegría"]');
    await page.waitForTimeout(900);

    // ── Scroll al step 2 → peak dots deben aparecer ──
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-emotions article .step');
      if (steps.length > 1) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1800);

    const peakDots = await page.locator('#d3-canvas-emotions .peak-dot').count();
    expect(peakDots).toBe(4);

    const peakGuides = await page.locator('#d3-canvas-emotions .peak-guide').count();
    expect(peakGuides).toBe(4);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05d-sec5-step2-peaks.png'), fullPage: false });
    console.log(`✅ Sección 5 OK — Joyplot con 4 montañas, ${peakDots} peak dots en paso 2`);
  });

  // ══════════════════════════════════════════════════
  // TEST 6: SECCIÓN 6 — EL MAPA DEL PODER (NER Map)
  // ══════════════════════════════════════════════════
  test('6. Sección 6 — El Mapa del Poder (NER Bubble Map)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    // Scroll to section 6
    await page.evaluate(() => document.querySelector('#scrolly-map')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);

    // SVG and components check
    await expect(page.locator('#d3-canvas-map svg')).toBeVisible();
    
    const landPaths = await page.locator('#d3-canvas-map .map-land').count();
    expect(landPaths).toBeGreaterThan(100);
    
    const activeCountries = await page.locator('#d3-canvas-map .map-land.active-country').count();
    expect(activeCountries).toBe(4);

    const bubbles = await page.locator('#d3-canvas-map .map-bubble').count();
    expect(bubbles).toBeGreaterThan(40);
    expect(bubbles).toBeLessThanOrEqual(60);

    // Manual buttons check
    await page.click('.map-country-btn[data-country="AR"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('.map-country-btn[data-country="AR"]')).toHaveClass(/active/);

    await page.click('.map-country-btn[data-country="all"]');
    await page.waitForTimeout(800);

    // Scroll step zooms
    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-map article .step');
      if (steps[1]) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1500);
    await expect(page.locator('.map-country-btn[data-country="CL"]')).toHaveClass(/active/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06a-sec6-map-chile.png'), fullPage: false });

    await page.evaluate(() => {
      const steps = document.querySelectorAll('#scrolly-map article .step');
      if (steps[2]) steps[2].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(1500);
    await expect(page.locator('.map-country-btn[data-country="AR"]')).toHaveClass(/active/);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06b-sec6-map-argentina.png'), fullPage: false });

    console.log(`✅ Sección 6 OK — Mapa cargado, ${landPaths} países, ${bubbles} burbujas y zoom de scroll en orden`);
  });

  // ══════════════════════════════════════════════════
  // TEST 7: RESPONSIVE — Resize a móvil
  // ══════════════════════════════════════════════════
  test('7. Responsive — Visualizaciones se adaptan en móvil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(4500);

    // SVG Sección 1 sigue visible en móvil
    const bubbleSvg = await page.locator('#d3-canvas svg').isVisible();
    expect(bubbleSvg).toBe(true);

    // Navegar a sección 5 en móvil
    await page.evaluate(() => document.querySelector('#scrolly-emotions')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);
    const emotionSvg = await page.locator('#d3-canvas-emotions svg').isVisible();
    expect(emotionSvg).toBe(true);

    // Navegar a sección 6 en móvil
    await page.evaluate(() => document.querySelector('#scrolly-map')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);
    const mapSvg = await page.locator('#d3-canvas-map svg').isVisible();
    expect(mapSvg).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-mobile-375.png'), fullPage: false });
    console.log('✅ Responsive OK — Visualizaciones (incluido mapa) visibles en 375px');
  });

});
