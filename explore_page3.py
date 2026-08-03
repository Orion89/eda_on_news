import asyncio
import sys
from pathlib import Path

# Force UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

WORKSPACE = Path(r"C:\Users\leomo\coder\ejercicios\nlp\eda_and_w2v_on_news")
SCREENSHOTS = WORKSPACE / "final_runs" / "run_1" / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)
OUTPUT = WORKSPACE / "explore_output2.txt"

async def main():
    out_lines = []
    def log(msg=""):
        out_lines.append(msg)
        print(msg, file=sys.stdout)

    async with async_playwright() as playwright:
        browser = await playwright.firefox.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await page.goto("http://localhost:8090/", wait_until="domcontentloaded")
        await page.screenshot(path=str(SCREENSHOTS / "explore_2_structure.png"))

        log("URL: " + page.url)
        log("TITLE: " + await page.title())

        # Get classes
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
        log(f"\nCLASSES ({len(classes)} total):")
        for c in sorted(classes):
            log(f"  - {c}")

        # Get sections details
        sections = await page.locator("section").all()
        log(f"\nSECTIONS: {len(sections)}")
        for i, sec in enumerate(sections):
            cls = await sec.get_attribute("class") or "None"
            heading_el = sec.locator("h1, h2, h3, h4").first
            count = await heading_el.count()
            heading = (await heading_el.text_content()).strip()[:60] if count > 0 else "None"
            svg_count = await sec.locator("svg").count()
            p_count = await sec.locator("p").count()
            log(f"  [{i}] cls='{cls[:80]}' heading='{heading}' svg={svg_count} p={p_count}")

        # Visualization tech check
        libs = await page.evaluate("""
            () => {
                const checks = [];
                if (typeof d3 !== 'undefined') checks.push('d3');
                if (typeof THREE !== 'undefined') checks.push('three.js');
                if (typeof Plotly !== 'undefined') checks.push('plotly');
                if (typeof echarts !== 'undefined') checks.push('echarts');
                if (document.querySelector('canvas')) checks.push('canvas');
                if (document.querySelector('svg')) checks.push('svg');
                if (document.querySelector('#vis')) checks.push('d3-force-3d');
                return checks;
            }
        """)
        log(f"\nVIS TECH: {libs}")

        # Scroll layout info
        scroll_info = await page.evaluate("""
            () => ({
                scrollHeight: document.documentElement.scrollHeight,
                windowHeight: window.innerHeight,
                scrollWidth: document.documentElement.scrollWidth,
                windowWidth: window.innerWidth,
                scrollTop: window.scrollY
            })
        """)
        log(f"\nLAYOUT:")
        for k, v in scroll_info.items():
            log(f"  {k}: {v}")

        # Interactive elements
        buttons = await page.locator("button").all()
        log(f"\nBUTTONS: {len(buttons)}")
        for i, btn in enumerate(buttons[:15]):
            txt = (await btn.text_content() or "").strip()[:50]
            role = await btn.get_attribute("role") or ""
            aria = await btn.get_attribute("aria-label") or ""
            cls = (await btn.get_attribute("class") or "").split()[:3]
            log(f"  [{i}] '{txt}' role='{role}' aria='{aria}' cls={cls}")

        links = await page.locator("a").all()
        log(f"\nLINKS: {len(links)}")
        for i, link in enumerate(links[:10]):
            href = await link.get_attribute("href") or ""
            txt = (await link.text_content() or "").strip()[:50]
            log(f"  [{i}] href='{href[:60]}' text='{txt}'")

        # Take screenshots at different scroll positions
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.3)")
        await asyncio.sleep(1)
        await page.screenshot(path=str(SCREENSHOTS / "explore_2_at_30pct.png"))
        log("\nSCREENSHOT: 30% scroll")

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.6)")
        await asyncio.sleep(1)
        await page.screenshot(path=str(SCREENSHOTS / "explore_2_at_60pct.png"))
        log("SCREENSHOT: 60% scroll")

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.9)")
        await asyncio.sleep(1)
        await page.screenshot(path=str(SCREENSHOTS / "explore_2_at_90pct.png"))
        log("SCREENSHOT: 90% scroll")

        # Back to top
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.5)

        # ARIA snapshot (just first section)
        first_section = await page.locator("section").first.aria_snapshot()
        log(f"\nFIRST SECTION ARIA (first 2000 chars):")
        log(first_section[:2000])

        await browser.close()

    OUTPUT.write_text("\n".join(out_lines), encoding="utf-8")
    log(f"\n--- Full output written to {OUTPUT} ---")

asyncio.run(main())
