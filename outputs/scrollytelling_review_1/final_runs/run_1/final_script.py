import os
import time
from playwright.sync_api import sync_playwright

def run():
    workspace = r'outputs\scrollytelling_review_1\final_runs\run_1'
    os.makedirs(workspace, exist_ok=True)
    log_path = os.path.join(workspace, 'final_script_log.txt')
    
    with open(log_path, 'w', encoding='utf-8') as log:
        log.write('step 0 params: url=http://localhost:8090/\n')
        
        with sync_playwright() as p:
            browser = p.firefox.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 1800})
            page = context.new_page()
            
            log.write('step 1 action: loading page\n')
            page.goto('http://localhost:8090/')
            time.sleep(2) # Wait for initial load
            
            # Find sections to scroll through
            # Based on the HTML, scrolly sections are likely inside #scrolly or are sections themselves
            # Let's find all elements that might be scrolly steps
            steps = page.query_selector_all('section')
            if not steps:
                # Fallback to something else if sections are not the main trigger
                steps = page.query_selector_all('.step, .scrolly-step')
            
            if not steps:
                # If we can't find specific steps, let's just scroll by viewport height
                total_height = page.evaluate('document.body.scrollHeight')
                step_height = 1800
                num_steps = (total_height // step_height) + 1
                steps = [f'scroll_{i}' for i in range(num_steps)]
            
            log.write(f'step 2 action: identified {len(steps)} steps\n')
            
            step_count = 0
            for i, step in enumerate(steps):
                step_count += 1
                if isinstance(step, str):
                    # Manual scrolling
                    y_offset = i * 1800
                    page.evaluate(f'window.scrollTo(0, {y_offset})')
                    log.write(f'step {step_count} action: manual scroll to {y_offset}\n')
                else:
                    # Scroll to element
                    step.scroll_into_view_if_needed()
                    log.write(f'step {step_count} action: scroll to step {i}\n')
                
                time.sleep(1.5) # Wait for potential animations
                
                # Capture screenshot
                screenshot_name = f'final_execution_{step_count}_scroll.png'
                screenshot_path = os.path.join(workspace, 'screenshots', screenshot_name)
                os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
                page.screenshot(path=screenshot_path)
                log.write(f'step {step_count} action: captured screenshot {screenshot_name}\n')
                
                # Capture text if it's an element
                if hasattr(step, 'inner_text'):
                    text = step.inner_text().strip()
                    if text:
                        log.write(f'step {step_count} action: text found: {text[:100]}...\n')
                else:
                    log.write(f'step {step_count} action: manual scroll step\n')

            log.write('final datum: Review complete. Check screenshots for visual/textual coherence.\n')
            browser.close()

if __name__ == '__main__':
    run()
