from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 1800})
        page.goto('http://localhost:8090/')
        print(f"Title: {page.title()}")
        with open('outputs/scrollytelling_review_1/content.html', 'w', encoding='utf-8') as f:
            f.write(page.content())
        browser.close()

if __name__ == '__main__':
    run()
