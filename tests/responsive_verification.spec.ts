import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8080';

test.describe('Responsive Layout & D3 Redraw Verification', () => {

    test.describe('Tarea 1: Layout CSS Desktop vs Mobile/Tablet', () => {
        test('Desktop (>= 992px): Two columns row-reverse, 55% sticky figure 100vh, 45% steps', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1000);

            const scrollyConstellation = page.locator('#scrolly-constellation');
            await expect(scrollyConstellation).toBeVisible();

            // Verify flex layout and direction on desktop
            const flexDir = await scrollyConstellation.evaluate(el => window.getComputedStyle(el).flexDirection);
            expect(flexDir).toBe('row-reverse');

            // Verify sticky figure dimensions on desktop (55% width, 100vh height)
            const figure = page.locator('#scrolly-constellation figure.sticky');
            const figBox = await figure.boundingBox();
            expect(figBox).not.toBeNull();
            if (figBox) {
                expect(figBox.width).toBeCloseTo(1280 * 0.55, 0); // ~704px
                expect(figBox.height).toBe(800); // 100vh
            }

            // Verify steps container dimensions on desktop (45% width)
            const stepsCol = page.locator('#scrolly-constellation .steps-container');
            const stepsBox = await stepsCol.boundingBox();
            expect(stepsBox).not.toBeNull();
            if (stepsBox) {
                expect(stepsBox.width).toBeCloseTo(1280 * 0.45, 0); // ~576px
            }
        });

        test('Mobile (< 992px): Single column stacked, sticky figure 50vh-60vh, steps scroll below', async ({ page }) => {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1000);

            const scrollyConstellation = page.locator('#scrolly-constellation');
            await expect(scrollyConstellation).toBeVisible();

            // Verify stacked column layout
            const flexDir = await scrollyConstellation.evaluate(el => window.getComputedStyle(el).flexDirection);
            expect(flexDir).toBe('column');

            // Verify sticky figure height is between 50vh and 60vh (55vh of 844 is ~464px)
            const figure = page.locator('#scrolly-constellation figure.sticky');
            const figHeight = await figure.evaluate(el => el.clientHeight);
            const expected50vh = 844 * 0.50;
            const expected60vh = 844 * 0.60;
            expect(figHeight).toBeGreaterThanOrEqual(expected50vh);
            expect(figHeight).toBeLessThanOrEqual(expected60vh);

            // Verify figure position is sticky at top with high z-index
            const figStyles = await figure.evaluate(el => {
                const s = window.getComputedStyle(el);
                return {
                    position: s.position,
                    top: s.top,
                    zIndex: parseInt(s.zIndex, 10) || 0
                };
            });
            expect(figStyles.position).toBe('sticky');
            expect(figStyles.top).toBe('0px');
            expect(figStyles.zIndex).toBeGreaterThanOrEqual(20);

            // Verify step cards have appropriate margins in mobile
            const stepCard = page.locator('#scrolly-constellation .step').first();
            const stepMargin = await stepCard.evaluate(el => {
                const s = window.getComputedStyle(el);
                return {
                    marginTop: parseFloat(s.marginTop),
                    marginBottom: parseFloat(s.marginBottom)
                };
            });
            expect(stepMargin.marginTop).toBeGreaterThan(0);
            expect(stepMargin.marginBottom).toBeGreaterThan(0);
        });

        test('Tablet (768px): Stacked column layout with sticky top figure', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1000);

            const scrolly = page.locator('#scrolly-constellation');
            const flexDir = await scrolly.evaluate(el => window.getComputedStyle(el).flexDirection);
            expect(flexDir).toBe('column');

            const figure = page.locator('#scrolly-constellation figure.sticky');
            const figBox = await figure.boundingBox();
            expect(figBox).not.toBeNull();
            if (figBox) {
                expect(figBox.width).toBe(768);
                // 55vh of 1024 is 563px, clamped by max-height 520px in style.css (50-60vh range)
                expect(figBox.height).toBeGreaterThanOrEqual(1024 * 0.50);
                expect(figBox.height).toBeLessThanOrEqual(1024 * 0.60);
            }
        });
    });

    test.describe('Tarea 2: Redibujado Dinámico en D3.js (Resize Pattern)', () => {
        test('Recalculates dimensions and updates SVG coordinates upon resizing from desktop to mobile', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1500);

            // Desktop width of constellation canvas
            const canvasDesktop = page.locator('#d3-canvas-constellation');
            const desktopWidth = await canvasDesktop.evaluate(el => el.clientWidth);
            expect(desktopWidth).toBeGreaterThan(600);

            // Initial node positions
            const initialNodePositions = await page.evaluate(() => {
                const nodes = document.querySelectorAll('#d3-canvas-constellation .node-group');
                return Array.from(nodes).map(n => n.getAttribute('transform'));
            });
            expect(initialNodePositions.length).toBe(4);

            // Resize to Mobile viewport
            await page.setViewportSize({ width: 390, height: 844 });
            // Wait for 250ms debounce
            await page.waitForTimeout(400);

            const mobileWidth = await canvasDesktop.evaluate(el => el.clientWidth);
            expect(mobileWidth).toBeLessThan(390);

            // SVG should have updated width and viewBox
            const svgAttr = await page.locator('#d3-canvas-constellation svg').evaluate(el => ({
                width: parseFloat(el.getAttribute('width') || '0'),
                viewBox: el.getAttribute('viewBox')
            }));
            expect(svgAttr.width).toBe(mobileWidth);
            expect(svgAttr.viewBox).toContain(`${mobileWidth}`);

            // Nodes should be inside bounds of the new mobile width
            const mobileNodeTransforms = await page.evaluate(() => {
                const nodes = document.querySelectorAll('#d3-canvas-constellation .node-group');
                return Array.from(nodes).map(n => {
                    const match = (n.getAttribute('transform') || '').match(/translate\(([^,]+),\s*([^)]+)\)/);
                    return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : null;
                });
            });

            for (const pos of mobileNodeTransforms) {
                expect(pos).not.toBeNull();
                if (pos) {
                    expect(pos.x).toBeGreaterThan(0);
                    expect(pos.x).toBeLessThan(mobileWidth);
                }
            }
        });

        test('Projection Arc and 2D Scatter recalculate linear scale ranges and snap on resize', async ({ page }) => {
            await page.setViewportSize({ width: 1200, height: 800 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1500);

            // Scroll to Section 2 (Projection Arc)
            await page.locator('#scrolly-projection').scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            const projSvg = page.locator('#d3-canvas-projection svg');
            await expect(projSvg).toBeVisible();

            // Resize to mobile
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(400);

            const projCanvasW = await page.locator('#d3-canvas-projection').evaluate(el => el.clientWidth);
            const projSvgW = await projSvg.evaluate(el => parseFloat(el.getAttribute('width') || '0'));
            expect(projSvgW).toBe(projCanvasW);

            // Scroll to Section 3 (2D Scatter)
            await page.locator('#scrolly-scatter').scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            const scatterCanvasW = await page.locator('#d3-canvas-scatter').evaluate(el => el.clientWidth);
            const scatterDots = page.locator('#d3-canvas-scatter .style-dot');
            await expect(scatterDots.first()).toBeVisible();

            const dotX = await scatterDots.first().evaluate(el => parseFloat(el.getAttribute('cx') || '0'));
            expect(dotX).toBeGreaterThan(0);
            expect(dotX).toBeLessThan(scatterCanvasW);
        });
    });

    test.describe('Tarea 3: UI Controls & Touch Events', () => {
        test('Filter containers have flex-wrap: wrap and buttons have min 44px touch target', async ({ page }) => {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1000);

            // Constellation interactive filter buttons in step 4
            const filterContainer = page.locator('#constellation-filter-buttons');
            const flexWrap = await filterContainer.evaluate(el => window.getComputedStyle(el).flexWrap);
            expect(flexWrap).toBe('wrap');

            const filterBtns = page.locator('#constellation-filter-buttons .filter-btn');
            const count = await filterBtns.count();
            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const btn = filterBtns.nth(i);
                const box = await btn.boundingBox();
                expect(box).not.toBeNull();
                if (box) {
                    expect(box.height).toBeGreaterThanOrEqual(44);
                    expect(box.width).toBeGreaterThanOrEqual(44);
                }
            }

            // Word action buttons in Section 2 and 3
            const wordPills = page.locator('#projection-word-pills .action-btn');
            const pillCount = await wordPills.count();
            if (pillCount > 0) {
                const pillBox = await wordPills.first().boundingBox();
                if (pillBox) {
                    expect(pillBox.height).toBeGreaterThanOrEqual(44);
                }
            }
        });

        test('Tooltip does not overflow window.innerWidth on mobile screens', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1500);

            // Hover on rightmost constellation node
            const nodes = page.locator('#d3-canvas-constellation .constellation-node');
            await nodes.first().hover();
            await page.waitForTimeout(200);

            const tooltip = page.locator('.tooltip');
            await expect(tooltip).toBeVisible();

            const tipBox = await tooltip.boundingBox();
            expect(tipBox).not.toBeNull();
            if (tipBox) {
                // Tooltip must remain within viewport width
                expect(tipBox.x).toBeGreaterThanOrEqual(0);
                expect(tipBox.x + tipBox.width).toBeLessThanOrEqual(375);
            }

            // Tap outside dismisses tooltip
            await page.mouse.click(10, 10);
            await page.waitForTimeout(300);
            const opacity = await tooltip.evaluate(el => parseFloat(window.getComputedStyle(el).opacity));
            expect(opacity).toBe(0);
        });

        test('Supports touch interaction on D3 nodes and links without errors', async ({ browser }) => {
            const context = await browser.newContext({
                hasTouch: true,
                viewport: { width: 390, height: 844 }
            });
            const page = await context.newPage();
            const errors: string[] = [];
            page.on('pageerror', err => {
                // Filter out benign browser notification standard in WebKit / Safari
                if (!err.message.includes('ResizeObserver loop')) {
                    errors.push(err.message);
                }
            });

            await page.goto(`${BASE_URL}/volumen-2.html`);
            await page.waitForTimeout(1500);

            // Tap on first node using native touchscreen
            const firstNode = page.locator('#d3-canvas-constellation .constellation-node').first();
            const box = await firstNode.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
                await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
            }
            await page.waitForTimeout(400);

            const tooltip = page.locator('.tooltip');
            await expect(tooltip).toBeVisible();
            if (errors.length > 0) {
                console.log('Page errors captured:', errors);
            }
            expect(errors.length).toBe(0);
            await context.close();
        });
    });
});
