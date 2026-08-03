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

        # Get classes (fixed for svg elements without className)
        classes = await page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                const classSet = new Set();
                all.forEach(el => {
                    if (el.className && typeof el.className === 'string') {
                        el.className.split(' ').forEach(c => {
                            if (c && c.length > 0) classSet.add(c);
                        });
                    }
                });
                return Array.from(classSet);
            }
        """)
        print(f"\nCLASSES ({len(classes)} total):")
        for c in sorted(classes):
            print(f"  - {c}")

        # Get scroll elements details
        scroll_elements = await page.locator("[class*='scroll'], [class*='story'], [class*='narrative'], [class*='telling']").all()
        print(f"\nSCROLL/STORY ELEMENTS: {len(scroll_elements)}")
        for i, el in enumerate(scroll_elements):
            tag = await el.evaluate("el => el.tagName")
            cls = await el.get_attribute("class")
            text = await el.inner_text()
            print(f"  [{i}] <{tag}> class='{cls}'")
            print(f"      text: {text[:200]}")

        # Get section details
        sections = await page.locator("section").all()
        print(f"\nSECTIONS: {len(sections)}")
        for i, sec in enumerate(sections):
            cls = await sec.get_attribute("class")
            heading = await sec.locator("h1, h2, h3, h4").first.text_content() if await sec.locator("h1, h2, h3, h4").first.count() > 0 else "None"
            svg_count = await sec.locator("svg").count()
            print(f"  [{i}] class='{cls[:80] if cls else 'None'}' heading='{heading.strip()[:60]}' svg={svg_count}")

        # Check for D3.js, Three.js, or other visualization libraries
        libs = await page.evaluate("""
            () => {
                const checks = [];
                if (typeof d3 !== 'undefined') checks.push('d3');
                if (typeof THREE !== 'undefined') checks.push('three.js');
                if (typeof Plotly !== 'undefined') checks.push('plotly');
                if (typeof echarts !== 'undefined') checks.push('echarts');
                if (document.querySelector('canvas')) checks.push('canvas');
                if (document.querySelector('svg')) checks.push('svg');
                return checks;
            }
        """)
        print(f"\nVISUALIZATION LIBRARIES/TECHNOLOGIES: {libs}")

        # Check scroll position and page height
        scroll_info = await page.evaluate("""
            () => ({
                scrollHeight: document.documentElement.scrollHeight,
                windowHeight: window.innerHeight,
                scrollWidth: document.documentElement.scrollWidth,
                windowWidth: window.innerWidth,
                scrollTop: window.scrollY
            })
        """)
        print(f"\nLAYOUT INFO:")
        for k, v in scroll_info.items():
            print(f"  {k}: {v}")

        # Get ARIA snapshot
        snapshot = await page.locator("body").aria_snapshot()
        print("\nARIA SNAPSHOT (first 5000 chars):")
        print(snapshot[:5000])

        await browser.close()

asyncio.run(main())
