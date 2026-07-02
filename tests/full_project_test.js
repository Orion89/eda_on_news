/**
 * Script de prueba completo para el Scrollytelling "El Eco de las Palabras"
 * Verifica cada sección, sus visualizaciones e interacciones.
 */
async function testProject(page) {
  const results = [];
  const errors = [];

  // ─────────────────────────────────────────────────
  // SETUP: Capturar errores de consola
  // ─────────────────────────────────────────────────
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`[UNCAUGHT] ${err.message}`));

  // ─────────────────────────────────────────────────
  // Esperar que la página cargue completamente
  // ─────────────────────────────────────────────────
  await page.waitForTimeout(4000);

  // PRUEBA 1: Título del Hero
  const heroTitle = await page.$eval('header h1', el => el.textContent.trim());
  results.push({ test: 'Hero title', pass: heroTitle.includes('Eco de las Palabras'), value: heroTitle });

  // PRUEBA 2: Verificar que el SVG de la Sección 1 (Bubble Chart) existe
  await page.evaluate(() => document.querySelector('#scrolly')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1200);
  const bubbleSvg = await page.$('#d3-canvas svg');
  results.push({ test: 'Sec1: Bubble Chart SVG exists', pass: !!bubbleSvg });

  const bubbleCount = await page.$$eval('#d3-canvas .bubble', els => els.length);
  results.push({ test: 'Sec1: Bubbles rendered (>0)', pass: bubbleCount > 0, value: bubbleCount });

  // PRUEBA 3: Texto de storytelling Sección 1
  const insightCards = await page.$$eval('#storytelling-insights .insight-card', els => els.length);
  results.push({ test: 'Sec1: Storytelling cards (4 paises)', pass: insightCards === 4, value: insightCards });

  // ─────────────────────────────────────────────────
  // SECCIÓN 2: Scatter Plot de Estilo
  // ─────────────────────────────────────────────────
  await page.evaluate(() => document.querySelector('#scrolly-style')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1200);

  const scatterSvg = await page.$('#d3-canvas-style svg');
  results.push({ test: 'Sec2: Scatter Plot SVG exists', pass: !!scatterSvg });

  const dotCount = await page.$$eval('#d3-canvas-style .style-dot', els => els.length);
  results.push({ test: 'Sec2: Dots rendered (>0)', pass: dotCount > 0, value: dotCount });

  const quadrantLines = await page.$$eval('#d3-canvas-style .quadrant-line', els => els.length);
  results.push({ test: 'Sec2: Quadrant lines (2)', pass: quadrantLines === 2, value: quadrantLines });

  // Probar botón de filtro por país (Chile)
  await page.click('.filter-btn[data-country="CL"]');
  await page.waitForTimeout(800);
  const clBtnActive = await page.$('.filter-btn[data-country="CL"].active');
  results.push({ test: 'Sec2: Filter CL button becomes active', pass: !!clBtnActive });

  // Volver a "Todos"
  await page.click('.filter-btn[data-country="all"]');
  await page.waitForTimeout(600);

  // ─────────────────────────────────────────────────
  // SECCIÓN 3: POS Stacked Bar Chart
  // ─────────────────────────────────────────────────
  await page.evaluate(() => document.querySelector('#scrolly-pos')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1500);

  const posSvg = await page.$('#d3-canvas-pos svg');
  results.push({ test: 'Sec3: POS Chart SVG exists', pass: !!posSvg });

  const posRects = await page.$$eval('#d3-canvas-pos .pos-rect', els => els.length);
  results.push({ test: 'Sec3: POS bars rendered (>0)', pass: posRects > 0, value: posRects });

  // Probar botón de país España
  await page.click('.pos-filter-btn[data-country="ES"]');
  await page.waitForTimeout(800);
  const esBtnActive = await page.$('.pos-filter-btn[data-country="ES"].active');
  results.push({ test: 'Sec3: Filter ES button active', pass: !!esBtnActive });

  // Probar botón "Ordenar por Subjetividad"
  await page.click('#btn-sort-pos');
  await page.waitForTimeout(900);
  const sortBtnActive = await page.$('#btn-sort-pos.active');
  results.push({ test: 'Sec3: Sort by subjectivity button active', pass: !!sortBtnActive });

  // Resetear
  await page.click('#btn-reset-pos');
  await page.waitForTimeout(600);

  // ─────────────────────────────────────────────────
  // SECCIÓN 5: Joyplot / Ridgeline de Emociones
  // ─────────────────────────────────────────────────
  await page.evaluate(() => document.querySelector('#scrolly-emotions')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1500);

  const emotionsSvg = await page.$('#d3-canvas-emotions svg');
  results.push({ test: 'Sec5: Ridgeline SVG exists', pass: !!emotionsSvg });

  const ridgeAreas = await page.$$eval('#d3-canvas-emotions .ridgeline-area', els => els.length);
  results.push({ test: 'Sec5: Ridge areas = 4 (uno por pais)', pass: ridgeAreas === 4, value: ridgeAreas });

  const ridgeStrokes = await page.$$eval('#d3-canvas-emotions .ridgeline-stroke', els => els.length);
  results.push({ test: 'Sec5: Ridge strokes = 4', pass: ridgeStrokes === 4, value: ridgeStrokes });

  const ridgeBaselines = await page.$$eval('#d3-canvas-emotions .ridgeline-baseline', els => els.length);
  results.push({ test: 'Sec5: Ridge baselines = 4', pass: ridgeBaselines === 4, value: ridgeBaselines });

  const ridgeLabels = await page.$$eval('#d3-canvas-emotions .ridgeline-country-label', els => els.length);
  results.push({ test: 'Sec5: Country labels = 4', pass: ridgeLabels === 4, value: ridgeLabels });

  // Probar botón "Miedo"
  await page.click('.emotion-btn[data-emotion="miedo"]');
  await page.waitForTimeout(900);
  const miedoActive = await page.$('.emotion-btn[data-emotion="miedo"].active');
  results.push({ test: 'Sec5: Miedo button becomes active', pass: !!miedoActive });

  const areasAfterMiedo = await page.$$eval('#d3-canvas-emotions .ridgeline-area', els => els.length);
  results.push({ test: 'Sec5: Still 4 areas after switching to Miedo', pass: areasAfterMiedo === 4 });

  // Probar botón "Ira"
  await page.click('.emotion-btn[data-emotion="ira"]');
  await page.waitForTimeout(800);

  // Probar botón "Tristeza"
  await page.click('.emotion-btn[data-emotion="tristeza"]');
  await page.waitForTimeout(800);

  // Volver a "Alegría"
  await page.click('.emotion-btn[data-emotion="alegría"]');
  await page.waitForTimeout(800);

  // ─────────────────────────────────────────────────
  // Trigger Step 2 de Emociones (peak dots)
  // ─────────────────────────────────────────────────
  await page.evaluate(() => {
    const steps = document.querySelectorAll('#scrolly-emotions article .step');
    if (steps.length > 1) steps[1].scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1500);

  const peakDots = await page.$$eval('#d3-canvas-emotions .peak-dot', els => els.length);
  results.push({ test: 'Sec5: Peak dots appear in step 2 (4)', pass: peakDots === 4, value: peakDots });

  const peakGuides = await page.$$eval('#d3-canvas-emotions .peak-guide', els => els.length);
  results.push({ test: 'Sec5: Peak guide lines (4)', pass: peakGuides === 4, value: peakGuides });

  // Texto de storytelling sección 5
  const emotionCards = await page.$$eval('#storytelling-insights-emotions .insight-card', els => els.length);
  results.push({ test: 'Sec5: Storytelling cards = 4', pass: emotionCards === 4, value: emotionCards });

  // ─────────────────────────────────────────────────
  // REPORTE FINAL
  // ─────────────────────────────────────────────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  REPORTE DE PRUEBAS — El Eco de las Palabras');
  console.log('═══════════════════════════════════════════════════');
  results.forEach(r => {
    const icon = r.pass ? '✅' : '❌';
    const extra = r.value !== undefined ? ` (valor: ${r.value})` : '';
    console.log(`  ${icon} ${r.test}${extra}`);
  });
  console.log('───────────────────────────────────────────────────');
  console.log(`  RESULTADO: ${passed}/${results.length} pruebas pasadas`);
  if (errors.length > 0) {
    console.log(`  ERRORES DE CONSOLA (${errors.length}):`);
    errors.forEach(e => console.log(`    ⚠️  ${e}`));
  } else {
    console.log('  ✅ Sin errores de consola JavaScript');
  }
  console.log('═══════════════════════════════════════════════════\n');
}
