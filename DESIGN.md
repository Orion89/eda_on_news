---
version: "alpha"
name: El Eco de las Palabras

description: >
  Design system for a scrollytelling data-journalism web application analyzing
  Spanish-language news media in Argentina, Chile, Spain and Mexico.
  The aesthetic channels premium editorial print — a broadsheet meets a data essay.
  Dark ink on warm off-white parchment, with four distinct country accent colours
  and a single neutral-slate anchor.

colors:
  bg: "#faf8f5"
  bg-alt: "#f3efe9"
  text-main: "#1f1e1d"
  text-muted: "#5c5956"
  accent: "#0f172a"
  border: "#e2dcd5"
  # Country palette — high contrast, distinct, professional
  ar: "#3a86c8"      # Argentina: Sky blue
  cl: "#d9383a"      # Chile: Crimson red
  es: "#f59e0b"      # España: Amber gold
  mx: "#10b981"      # México: Emerald green
  # POS chart colours
  pos-adj: "#ff7a00"   # Adjectives / subjectivity
  pos-verb: "#3b82f6"  # Verbs / action
  pos-noun: "#555555"  # Nouns / reference
  pos-other: "#e5e7eb" # Grammar / other
  # Beeswarm readability zones
  beeswarm-basica: "#86c56b"
  beeswarm-media: "#ffc850"
  beeswarm-univ: "#dc5050"

typography:
  hero-title:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: clamp(2.5rem, 6vw, 4.5rem)
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: -0.02em
  section-title:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: clamp(2rem, 4vw, 3rem)
    fontWeight: 800
    lineHeight: 1.2
  step-h3:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 1.75rem
    fontWeight: 800
    lineHeight: 1.25
  lead:
    fontFamily: Lora, Georgia, serif
    fontSize: 1.45rem
    fontWeight: 500
    lineHeight: 1.65
  body-md:
    fontFamily: Lora, Georgia, serif
    fontSize: 1.15rem
    lineHeight: 1.75
  section-intro:
    fontFamily: Source Sans 3, system-ui, sans-serif
    fontSize: 1.2rem
    lineHeight: 1.7
  eyebrow:
    fontFamily: Source Sans 3, system-ui, sans-serif
    fontSize: 0.85rem
    fontWeight: 700
    letterSpacing: 0.15em
  step-body:
    fontFamily: Lora, Georgia, serif
    fontSize: 1.05rem
    lineHeight: 1.7
  meta-sans:
    fontFamily: Source Sans 3, system-ui, sans-serif
    fontSize: 0.8rem
    fontWeight: 600
  tooltip:
    fontFamily: Source Sans 3, system-ui, sans-serif
    fontSize: 0.85rem
    lineHeight: 1.45

rounded:
  sm: 4px
  md: 8px
  lg: 12px
  pill: 50px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section-pad: 8rem

components:
  hero:
    backgroundColor: "linear-gradient(180deg, #f4eee1 0%, {colors.bg} 100%)"
    textColor: "{colors.text-main}"
    padding: "4rem 1.5rem"
  country-tag:
    backgroundColor: "{colors.ar}"  # varies per country
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1.2rem"
    typography: "{typography.eyebrow}"
  filter-btn:
    backgroundColor: "#ffffff"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.9rem"
  filter-btn-active:
    backgroundColor: "{colors.text-main}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  action-btn:
    backgroundColor: transparent
    textColor: "{colors.text-main}"
    rounded: "{rounded.sm}"
    padding: "0.35rem 1rem"
  action-btn-active:
    backgroundColor: "{colors.text-main}"
    textColor: "#ffffff"
  step-card:
    backgroundColor: "rgba(250, 248, 245, 0.97)"
    textColor: "{colors.text-main}"
    rounded: "{rounded.lg}"
    padding: "2.5rem"
  step-card-active:
    backgroundColor: "rgba(250, 248, 245, 0.97)"
    rounded: "{rounded.lg}"
  insight-card:
    backgroundColor: "#ffffff"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: "1.25rem"
  tooltip:
    backgroundColor: "rgba(31, 30, 29, 0.96)"
    textColor: "#ffffff"
    rounded: "6px"
    padding: "0.7rem 1rem"
  social-btn:
    backgroundColor: transparent
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "0.3rem 0.7rem"
---

## Overview

**Editorial Minimalism meets Data-Journalism Gravitas.**

The UI evokes a premium broadsheet or contemporary data essay — warm parchment tones, deep ink typography, and restrained use of colour. Visualisations occupy a sticky righthand panel (55 % of viewport width on desktop) while narrative step-cards scroll on the left. The experience is content-first: every visual choice either serves legibility or communicates data meaning.

## Colors

The palette is rooted in warm neutrals with four vivid country accents. No decorative colour exists; every hue carries semantic weight.

- **`#faf8f5` (`--color-bg`):** Soft off-white, the primary page canvas. Slightly warmer than pure white to feel editorial, not sterile.
- **`#f3efe9` (`--color-bg-alt`):** Used for sticky figure backgrounds, the footer, and container insets — perceptibly darker without being a grey.
- **`#1f1e1d` (`--color-text-main`):** Warm deep charcoal, the ink colour. Used for headings, body text, active button backgrounds, and step-card borders when active.
- **`#5c5956` (`--color-text-muted`):** Elegant medium grey. Captions, meta, inactive buttons, footer text.
- **`#0f172a` (`--color-accent`):** Slate dark. Used sparingly for strong visual anchors: the loading spinner, step-number underline, Sankey active-button fill.
- **`#e2dcd5` (`--color-border`):** Warm parchment border — dividers, card edges, filter-bar bottoms.

### Country Colours

Used exclusively to identify the four countries. **Never use these for decorative purposes.** They must appear together as a set when possible.

| Country   | Variable       | Hex       | Meaning          |
|-----------|----------------|-----------|------------------|
| Argentina | `--color-ar`   | `#3a86c8` | Sky blue         |
| Chile     | `--color-cl`   | `#d9383a` | Crimson red      |
| España    | `--color-es`   | `#f59e0b` | Amber gold       |
| México    | `--color-mx`   | `#10b981` | Emerald green    |

These four colours appear as:
- Country tag pills in the hero section.
- Left border accent on `.insight-card.country-border-{ar|cl|es|mx}`.
- Fill/stroke colour of all D3 data marks (bubbles, scatter dots, ridgeline areas, sankey nodes, beeswarm circles, stacked bars).
- The `.insight-country` heading colour within each card.

### Chart-Specific Colours

The POS stacked-bar chart uses a separate semantic colour set:

| POS Category | Hex       | Meaning              |
|--------------|-----------|----------------------|
| Adjectives   | `#ff7a00` | Subjectivity / value |
| Verbs        | `#3b82f6` | Action / dynamism    |
| Nouns        | `#555555` | Factual reference    |
| Other        | `#e5e7eb` | Grammar particles    |

The beeswarm (readability) chart uses three zone colours (15–20 % opacity fills, solid left-border accents):

| Zone         | Colour    | INFLESZ range  |
|--------------|-----------|----------------|
| Básica       | `#86c56b` | ≥ 65 (easy)    |
| Media        | `#ffc850` | 40–64 (medium) |
| Universitaria| `#dc5050` | < 40 (hard)    |

## Typography

Three font families, each with a distinct role. **Never mix roles.**

| Family             | Variable           | Role                                               |
|--------------------|--------------------|----------------------------------------------------|
| Playfair Display   | `--font-heading`   | H1, H2, H3 (all section and step titles)           |
| Lora               | `--font-body`      | All narrative body paragraphs (`body`, `.lead-text`, `.body-text`, `.step p`) |
| Source Sans 3      | `--font-sans`      | UI chrome: eyebrows, labels, buttons, metadata, tooltips, footer, axis tick labels |

All three are loaded from Google Fonts with `display=swap`.

### Type Scale

| Token          | Family          | Size                        | Weight | Use                                   |
|----------------|-----------------|-----------------------------|--------|---------------------------------------|
| `hero-title`   | Playfair Display | `clamp(2.5rem, 6vw, 4.5rem)` | 900    | Page `<h1>`                           |
| `section-title`| Playfair Display | `clamp(2rem, 4vw, 3rem)`    | 800    | `<h2>` section headers                |
| `step-h3`      | Playfair Display | `1.75rem`                   | 800    | Step card `<h3>` titles               |
| `lead`         | Lora            | `1.45rem`                   | 500    | First paragraph of intro section      |
| `body-md`      | Lora            | `1.15rem`                   | 400    | Standard body paragraphs              |
| `section-intro`| Source Sans 3   | `1.2rem`                    | 400    | `.section-intro-text` below divider `<h2>` |
| `eyebrow`      | Source Sans 3   | `0.85rem`                   | 700    | Uppercase labels above headings, `letter-spacing: 0.15em` |
| `step-body`    | Lora            | `1.05rem`                   | 400    | Step card paragraph text              |
| `meta-sans`    | Source Sans 3   | `0.8rem`                    | 600–700 | Step numbers, button labels, insight metadata |

> **Anti-pattern:** Do not set body text in Source Sans 3 or use Playfair Display for UI labels. The division is strict.

## Layout System

The application is a single-page vertical scroll. Two layout zones alternate throughout:

### Section Dividers (`.section-divider`)

Full-width centered blocks that introduce each visualization section. Structure:

```html
<section class="section-divider">
  <div class="container">
    <span class="section-eyebrow">Category Label</span>
    <h2 class="section-title">Section Title</h2>
    <p class="section-intro-text">One-paragraph framing text.</p>
    <div class="section-divider-line"></div>
  </div>
</section>
```

- Top padding: `8rem`; bottom: `4rem`.
- `border-top: 1px solid var(--color-border)`.
- Background: `var(--color-bg)` (same as page, not alt).
- `.section-divider-line`: `60px × 2px`, `var(--color-border)`, centered with `margin: 2.5rem auto 0 auto`.

### Scrollytelling Panels (`#scrolly-*`)

Each visualization section is a side-by-side layout on desktop (≥ 992 px):

```
┌─────────────────────────┬─────────────────────────────────┐
│   Steps column (45 %)   │   Sticky viz panel (55 %)       │
│   .steps-container      │   figure.sticky > .viz-wrapper  │
│   scroll normally       │   height: 100vh, position:sticky│
└─────────────────────────┴─────────────────────────────────┘
```

On mobile, it collapses to a vertical stack: sticky figure (50–70 vh) on top, steps below.

The `flex-direction: row-reverse` pattern places the figure on the right and the text on the left in the DOM order.

### Container

```css
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

Used for all narrative/intro content. The scrollytelling panels span full width and do not use `.container` directly.

## Component Patterns

### Step Cards (`.step`)

Translucent cream cards that carry the narrative text for each scroll stop.

```css
.step {
  background: rgba(250, 248, 245, 0.97);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 480px;    /* 460px on desktop */
  opacity: 0.35;       /* dimmed until active */
  backdrop-filter: blur(8px);
}
.step.is-active {
  opacity: 1;
  transform: translateY(-4px) scale(1.01);
  border-color: var(--color-text-main);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}
```

Internal anatomy:
1. `.step-num` — Source Sans 3, 0.8 rem, 700 weight, muted colour, underlined by a 2 px `var(--color-accent)` border-bottom.
2. `<h3>` — Playfair Display, 1.75 rem, 800 weight.
3. `<p>` — Lora, 1.05 rem, muted colour.
4. (optional) `.insights-grid` or a named `#storytelling-insights-*` div for JS-injected content.

Spacing between steps: `margin: 55vh auto 55vh auto` (desktop). First step: `margin-top: 20vh`. Last step: `margin-bottom: 45vh`.

### Insight Cards (`.insight-card`)

Country-attributed story cards injected by JavaScript into `#storytelling-insights` and similar containers.

```html
<div class="insights-grid">
  <div class="insight-card country-border-ar">
    <h4 class="insight-country">Argentina</h4>
    <p class="insight-text">Narrative sentence…</p>
    <div class="insight-meta">Dominant emotion: Tristeza · Peak: 2019-11</div>
  </div>
  <!-- repeat for other countries -->
</div>
```

- `.insights-grid`: `display: flex; flex-direction: column; gap: 1.25rem`.
- `.insight-card`: white background, `border-radius: 8px`, `padding: 1.25rem`, `border-left: 4px solid <country-color>`.
- `.insight-country`: Source Sans 3, 0.8 rem, 700, uppercase, `letter-spacing: 0.08em`, coloured by country variable.
- `.insight-text`: Lora (inherited body), 0.95 rem, `line-height: 1.65`.
- `.insight-meta`: Source Sans 3, 0.75 rem, muted colour.

### Filter / Selector Buttons

All interactive controls live inside `.filter-container`:

```css
.filter-container {
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}
```

Three button variants share the same visual grammar:

| Class           | Shape   | Default state                     | Active state                                |
|-----------------|---------|-----------------------------------|---------------------------------------------|
| `.filter-btn`   | Pill    | white bg, muted text, border      | `--color-text-main` bg, white text          |
| `.pos-filter-btn` | Pill  | same as filter-btn                | same active                                 |
| `.emotion-btn`  | Pill    | same                              | same                                        |
| `.map-country-btn` | Pill | same                              | same                                        |
| `.sankey-country-btn` | Pill | same                          | `--color-accent` bg (darker than text-main) |
| `.action-btn`   | Rounded (4px) | transparent, border, text-main | text-main bg, white text            |

A `.filter-label` (0.75 rem, 700, uppercase, muted) precedes each group of buttons.
A `.filter-separator` (`|` character, muted colour) divides country filters from action buttons.

### Tooltip

Dark floating panel, shown on D3 element hover:

```css
.tooltip {
  background: rgba(31, 30, 29, 0.96);
  color: #ffffff;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(4px);
}
```

Internal structure: `.tooltip-title` (0.9 rem, bold, border-bottom) + one or more `.tooltip-row` lines.

### Visualization Canvas (`.viz-canvas`)

The white drawing surface inside the sticky figure:

```css
.viz-canvas {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.01), 0 4px 20px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}
```

Before the D3 chart loads, a `.viz-placeholder` with a `.spinner` (animated border-top) and two text lines is shown.

### Social Buttons (Footer)

Pill-shaped icon+label buttons used in `.footer-author`:

```css
.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
}
```

SVG icons are inline, `width="16" height="16"`, `fill="currentColor"`, `opacity: 0.75`.

## Sections & Page Structure

The page consists of the following blocks in order:

1. **`<header class="hero">`** — Full-viewport hero with eyebrow, `<h1>`, subtitle, hero-line (80 × 3 px rule), four country tags, and a bouncing scroll indicator.
2. **`.intro-section`** — Two-paragraph prose context. `padding: 8rem 0`. Uses `.lead-text` + `.body-text`.
3. **Section 1 — Divider + `#scrolly`** — Bubble chart. Steps: `data-step="1"` (overview + insight cards), `data-step="2"` (concentration rule).
4. **Section 2 — Divider + `#scrolly-style`** — Scatter plot. Steps: `data-step="1"` (axes explanation), `data-step="2"` (country contrasts + insight card).
5. **Section 3 — Divider + `#scrolly-pos`** — 100% stacked bar chart. Steps: `data-step="1"` (colour key explanation), `data-step="2"` (subjectivity ranking + insight card). Has POS legend bar + sort/reset action buttons.
6. **Section 5 — Divider + `#scrolly-emotions`** — Ridgeline (Joyplot). Steps: `data-step="1"` (chart explanation), `data-step="2"` (country narratives + insight cards). Has emotion selector buttons.
7. **Section 6 — Divider + `#scrolly-map`** — NER Bubble Map. Country selector buttons.
8. **Section 7 — Divider + `#scrolly-beeswarm`** — INFLESZ Beeswarm. 70 vh sticky height. Has `.beeswarm-legend`, readability zone backgrounds, `.beeswarm-median-line` (dashed, animated to visible on trigger).
9. **Section 8 — Divider + `#scrolly-sankey`** — Authorship Sankey. 70 vh sticky height. `.sankey-controls` at top.
10. **`<footer class="footer">`** — `.footer-top` (title/subtitle left, author+social right) → `.footer-divider` → `.footer-grid` (3-col: Fuentes / Métodos / Referencias).

> **Note:** Section 4 (La Barrera de Legibilidad) was skipped in the original plan and maps to what is labeled Section 7 in the source (`#scrolly-beeswarm`). Step numbers follow the original plan (e.g., `08.1` for Sankey).

## D3 Chart Conventions

All charts are rendered as `<svg>` elements appended into `.viz-canvas` divs. Shared patterns:

### Axes
```css
.axis path, .axis line { stroke: var(--color-border); }
.axis text {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  fill: var(--color-text-muted);
}
.axis-label {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  fill: var(--color-text-main);
}
```

### Data Marks by Chart Type

| Chart     | CSS class           | Default stroke          | Hover effect                          |
|-----------|---------------------|-------------------------|---------------------------------------|
| Bubble    | `.bubble`           | `rgba(255,255,255,0.7)` | `brightness(0.85) contrast(1.1)`      |
| Scatter   | `.style-dot`        | `rgba(255,255,255,0.8)` | `stroke: #1f1e1d, stroke-width: 1.5px`|
| POS Bars  | `.pos-rect`         | none                    | `brightness(0.9) contrast(1.1)`       |
| Ridgeline | `.ridgeline-area`   | —                       | `fill-opacity: 0.9`                   |
| Ridgeline | `.ridgeline-stroke` | 1.5 px, no fill         | —                                     |
| Map       | `.map-bubble`       | `#ffffff`               | `fill-opacity: 0.95`                  |
| Beeswarm  | `.bee-circle`       | `#ffffff, 1.2px`        | `stroke-width: 2.5px, brightness(1.1)`|
| Sankey    | `.sankey-link`      | country colour, 0.35 opacity | 0.75 opacity                     |
| Sankey    | `.sankey-node`      | `#ffffff, 1px`          | `fill-opacity: 0.85`                  |

### Ridgeline-Specific Labels

```css
.ridgeline-country-label {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  fill: var(--color-text-muted);
}
.ridgeline-baseline {
  stroke: var(--color-border);
  stroke-width: 1px;
  opacity: 0.8;
}
```

Peak dots (`.peak-dot`) mark the historical maximum intensity point on ridgeline curves.

### Quadrant Lines (Scatter Plot)

```css
.quadrant-line {
  stroke: #c8c2b7;
  stroke-width: 1px;
  stroke-dasharray: 4, 4;
  opacity: 0.7;
}
.quadrant-label {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  fill: var(--color-text-muted);
  opacity: 0.35;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  pointer-events: none;
}
```

## Interactive States & Transitions

All transitions use `ease` or named cubic-bezier easing. Key patterns:

| Element         | Transition property          | Duration | Easing                           |
|-----------------|------------------------------|----------|----------------------------------|
| `.step`         | transform, border-color, opacity, box-shadow | 0.4s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `.insight-card` | transform, box-shadow        | 0.2s     | ease                             |
| `.filter-btn`   | background, border, color    | 0.2s     | ease                             |
| `.bubble`       | filter, stroke, stroke-width | 0.2s     | ease                             |
| `.ridgeline-area` | fill-opacity               | 0.2s     | ease                             |
| `.bee-circle`   | opacity, stroke-width        | 0.4s     | ease                             |
| `.beeswarm-median-line` | opacity              | 0.4s     | ease                             |
| `.sankey-link`  | stroke-opacity               | 0.25s    | ease                             |
| `.country-tag`  | transform, box-shadow        | 0.2s     | ease                             |
| `.social-btn`   | border-color, color, background | 0.2s  | ease                             |

**Dimming pattern:** When a country is filtered/highlighted, non-selected marks use `opacity: 0.08–0.12` (`dimmed` class). Selected marks use `opacity: 1` (`highlighted` class).

## Footer Structure

The footer uses `var(--color-bg-alt)` background, matching the sticky viz panels.

```
.footer
  .container.footer-inner
    .footer-top
      div  ← project title + subtitle (left)
      .footer-author  ← author name + .footer-social (right)
    .footer-divider  ← 1px border
    .footer-grid  ← 3 columns: Fuentes | Métodos | Referencias
      .footer-section × 3
        h3.footer-heading  ← uppercase, 0.72rem, muted
        p.footer-text / ul.footer-refs
```

All footer text is `var(--color-text-muted)` at 0.85 opacity — intentionally subordinate to the main content. Links use `text-underline-offset: 2px` and transition to `var(--color-text-main)` on hover.

Footer refs (`footer-refs li`) use `–` as a pseudo-element bullet via `::before`.

## Animations

```css
@keyframes fadeIn  { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
@keyframes bounce  { 0%,20%,50%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-8px) } 60% { transform:translateY(-4px) } }
@keyframes spin    { to { transform:rotate(360deg) } }
```

- `fadeIn` — Applied to `.hero-content` (`1.2s ease-out`). Entry animation only.
- `bounce` — Applied to `.scroll-indicator` (`2s infinite`).
- `spin` — Applied to `.spinner` (`1.2s infinite linear`).

## Responsive Breakpoints

Single breakpoint at `992px` (desktop threshold):

| Breakpoint | Behavior |
|---|---|
| < 992 px (mobile) | Single column: sticky figure on top (50–70 vh), steps below. Footer grid collapses to 1 column. Figure `border-bottom` instead of `border-left`. |
| ≥ 992 px (desktop) | Side-by-side: `row-reverse` flex, figure 55 % right, steps 45 % left. Figure `height: 100vh`. |

The only additional responsive concern is footer: at `max-width: 768px`, `.footer-top` stacks vertically and `.footer-author` left-aligns.

## Brand Voice & Narrative Tone

The narrative text (step cards, section intros, insight cards) follows a consistent voice:

- **Register:** Literary-journalistic. Authoritative but accessible. Rhetorical questions open sections ("¿Qué tipo de palabras sostienen los textos noticiosos?").
- **Structure:** Lead with a hook or observation → specific quantitative finding → comparative insight across countries.
- **Data references:** Always mention the specific medium name and the precise figure (e.g., "cooperativa.cl, con 39.4 palabras por oración"). Avoid vague language.
- **Country framing:** Each insight card is scoped to one country, identified by `.insight-country` heading. Cards for all four countries always appear together as a set.
- **Step numbers:** Follow the pattern `NN.M` (e.g., `01.1`, `02.2`, `05.1`). The section number is the leading digits; the step within the section is after the dot.

## Tech Stack & Dependencies (CDN)

| Library            | Version | Use                                   |
|--------------------|---------|---------------------------------------|
| D3.js              | 7.9.0   | All visualizations                    |
| d3-sankey          | 0.12.3  | Section 8 Sankey diagram              |
| Scrollama.js       | 3.2.0   | Scroll progress detection             |
| TopoJSON client    | 3.1.0   | Section 6 geographic map              |
| Google Fonts       | —       | Playfair Display, Lora, Source Sans 3 |

No frameworks, bundlers, or preprocessors. Pure HTML/CSS/JavaScript. All styles in `style.css`, all logic in `main.js`.

## CSS Custom Properties Reference

```css
:root {
  --color-bg: #faf8f5;
  --color-bg-alt: #f3efe9;
  --color-text-main: #1f1e1d;
  --color-text-muted: #5c5956;
  --color-accent: #0f172a;
  --color-border: #e2dcd5;
  --color-ar: #3a86c8;
  --color-cl: #d9383a;
  --color-es: #f59e0b;
  --color-mx: #10b981;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --font-sans: 'Source Sans 3', system-ui, -apple-system, sans-serif;
}
```

> **Rule for new pages:** Always reference these CSS custom properties. Never hardcode hex values for anything already defined in `:root`. This ensures the palette stays consistent across any future pages or components added to the project.
