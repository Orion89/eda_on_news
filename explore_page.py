import asyncio
import os
from pathlib import Path

from playwright.async_api import async_playwright

WORKSPACE = Path(r"C:\Users\leomo\coder\ejercicios\nlp\eda_and_w2v_on_news")
SCREENSHOTS = WORKSPACE / "final_runs" / "run_1" / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.firefox.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await page.goto("http://localhost:8090/", wait_until="domcontentloaded")
        await page.screenshot(path=str(SCREENSHOTS / "explore_1_start.png"))

        print("URL:", page.url)
        print("TITLE:", await page.title())

        # Get basic page structure
        html = await page.inner_html("body")
        print("BODY LENGTH:", len(html))

        # Get headings
        headings = await page.locator("h1, h2, h3, h4").all()
        print("\nHEADINGS:")
        for h in headings:
            text = await h.inner_text()
            tag = await h.evaluate("el => el.tagName")
            print(f"  <{tag}>: {text.strip()[:100]}")

        # Get images
        images = await page.locator("img").all()
        print(f"\nIMAGES: {len(images)}")
        for i, img in enumerate(images[:5]):
            src = await img.get_attribute("src")
            alt = await img.get_attribute("alt")
            print(f"  [{i}] src: {src[:80] if src else 'None'} alt: {alt}")

        # Get any video/audio elements
        videos = await page.locator("video").all()
        audios = await page.locator("audio").all()
        print(f"\nVIDEOS: {len(videos)}")
        print(f"AUDIO: {len(audios)}")

        # Get canvas elements (for charts/visualizations)
        canvases = await page.locator("canvas").all()
        print(f"CANVAS: {len(canvases)}")

        # Get semantic sections
        sections = await page.locator("section").all()
        print(f"\nSECTIONS: {len(sections)}")

        # Get any divs with scroll-related classes or IDs
        scroll_elements = await page.locator("[class*='scroll'], [class*='story'], [class*='narrative'], [class*='telling']").all()
        print(f"SCROLL/STORY ELEMENTS: {len(scroll_elements)}")

        # Get all classes used in the page
        classes = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                const classSet = new Set();
                all.forEach(el => {
                    el.className.split(' ').forEach(c => {
                        if (c && c.length > 0) classSet.add(c);
                    });
                });
                return Array.from(classSet);
            }
        """)
        print(f"\nCLASSES ({len(classes)} total):")
        for c in classes[:50]:
            print(f"  - {c}")
        if len(classes) > 50:
            print(f"  ... and {len(classes) - 50} more")

        # ARIA snapshot of visible content (truncated)
        snapshot = await page.locator("body").aria_snapshot()
        print("\nARIA SNAPSHOT (first 4000 chars):")
        print(snapshot[:4000])

        await browser.close()

asyncio.run(main())
