import { test, expect } from '@playwright/test';

const viewports = [
    { name: 'mobile-iphone', width: 390, height: 844 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop-laptop', width: 1366, height: 768 }
];

for (const vp of viewports) {
    test(`Capture diagnostic screenshots on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('http://127.0.0.1:8080');
        await page.waitForTimeout(1000);

        // Screenshot Hero
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-01-hero.png` });

        // Scroll to Section 1
        const sec1 = page.locator('#scrolly');
        await sec1.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-02-sec1.png` });

        // Scroll to Section 2
        const sec2 = page.locator('#scrolly-style');
        await sec2.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-03-sec2.png` });

        // Scroll to Section 3
        const sec3 = page.locator('#scrolly-pos');
        await sec3.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-04-sec3.png` });

        // Scroll to Section 5
        const sec5 = page.locator('#scrolly-emotions');
        await sec5.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-05-sec5.png` });

        // Scroll to Section 6
        const sec6 = page.locator('#scrolly-map');
        await sec6.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-06-sec6.png` });

        // Scroll to Section 7
        const sec7 = page.locator('#scrolly-beeswarm');
        await sec7.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-07-sec7.png` });

        // Scroll to Section 8
        const sec8 = page.locator('#scrolly-sankey');
        await sec8.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-08-sec8.png` });

        // Scroll to Footer
        const footer = page.locator('.footer');
        await footer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `tests/screenshots/diag-${vp.name}-09-footer.png` });
    });
}
