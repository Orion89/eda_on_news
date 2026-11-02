import { test } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://127.0.0.1:8080';
const ARTIFACT_DIR = 'C:/Users/leomo/.gemini/antigravity-cli/brain/32bddc60-16c1-49a4-bb06-a22af66ec252';

test.describe('Capture Responsive Screenshots', () => {

    test('Capture Desktop (1280x800) screenshots', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });

        // Vol 2 - Constellation
        await page.goto(`${BASE_URL}/volumen-2.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly-constellation').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_desktop_constellation.png') });

        // Vol 2 - Projection Arc
        await page.locator('#scrolly-projection').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_desktop_projection.png') });

        // Vol 2 - 2D Scatter
        await page.locator('#scrolly-scatter').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_desktop_scatter.png') });

        // Vol 1 - Bubble / Scatter
        await page.goto(`${BASE_URL}/index.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol1_desktop_bubbles.png') });
    });

    test('Capture Tablet (768x1024) screenshots', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });

        // Vol 2 - Constellation
        await page.goto(`${BASE_URL}/volumen-2.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly-constellation').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_tablet_constellation.png') });

        // Vol 2 - Projection Arc
        await page.locator('#scrolly-projection').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_tablet_projection.png') });

        // Vol 1 - Bubble
        await page.goto(`${BASE_URL}/index.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol1_tablet_bubbles.png') });
    });

    test('Capture Mobile (390x844) screenshots', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        // Vol 2 - Constellation
        await page.goto(`${BASE_URL}/volumen-2.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly-constellation').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_mobile_constellation.png') });

        // Vol 2 - Projection Arc
        await page.locator('#scrolly-projection').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_mobile_projection.png') });

        // Vol 2 - 2D Scatter
        await page.locator('#scrolly-scatter').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol2_mobile_scatter.png') });

        // Vol 1 - Bubble
        await page.goto(`${BASE_URL}/index.html`);
        await page.waitForTimeout(1000);
        await page.locator('#scrolly').scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vol1_mobile_bubbles.png') });
    });

});
