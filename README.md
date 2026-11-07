# James Watts Portfolio

A responsive GitHub Pages portfolio focused on BIM, preconstruction, facade systems, technical communication, automation, and visualization.

## Main pages

- `index.html` — home page, About, Experience, Portfolio, Freelance, and Contact sections
- `freelance.html` — independent glazing modeling services, past projects, scope-based pricing, and contact
- `bim-coordination.html` — 3D Modeling portfolio and project index
- `facade-design-manual.html` — facade design portfolio category
- `automation.html` — automation portfolio category
- `documentation.html` — Logistics & Proposals portfolio category
- `visualization.html` — visualization portfolio category

## Main editing files

- `swiss-theme.css` — current Athletics typography, colors, grids, spacing, and responsive layout
- `style.css` — original/base styling
- `script.js` — section expansion, navigation behavior, and contact fasteners
- `books-data.js` — personal library titles, covers, and future ratings and quotes
- `books.js` / `books.css` — flat 2026 bookshelf, cover-inspired SVG spines, personal star ratings, and drag/touch/keyboard ordering saved in the current browser
- `project-index.js` — project names, locations, project details, image counts, and project-index interactions

## Assets

- `assets/James-Watts-Resume.pdf` — downloadable resume
- `assets/project-index/` — project image folders used by `project-index.js`
- `assets/logistics-proposal/` — selected Logistics & Proposals sheets
- `assets/contact-fasteners-layout/` — contact-section fastener artwork
- `assets/fonts/` — Athletics Sans font family
- `assets/*-home-spin.mp4` — sanitized, rendered model animations used on the home page

## Model presentation

The public site uses pre-rendered MP4 animations rather than publishing raw IFC or Fragment model data. Files ending in `.ifc` or `.frag` are excluded from Git and must remain local. The retired interactive IFC viewer and its build dependencies have been removed from the public repository.

## Publishing

The production site is deployed from the `main` branch through GitHub Pages.
