# Awesome Hacking — Static Website

A clean, navigable static website for the [awesome-hacking](https://github.com/carpedm20/awesome-hacking) curated list. Same content, better reading experience.

## Features

- **Table of Contents** — Persistent left sidebar with collapsible sections and active-section tracking
- **Fuzzy Search** — Client-side search across headings and list items with highlighted matches
- **Dark / Light Theme** — Toggle with localStorage persistence
- **Back to Top** — Scroll-to-top button appears on scroll
- **Responsive** — Mobile-friendly with collapsible TOC drawer
- **Accessible** — Skip-to-content link, semantic HTML, ARIA labels, focus states, reduced-motion support
- **SEO** — Meta tags, OpenGraph, semantic structure
- **Zero backend** — Fully static, deploy anywhere

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

## Project Structure

```
awesome-hacking-site/
├── content/
│   └── awesome-hacking.md       # Source markdown (verbatim from repo)
├── public/
│   └── favicon.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # TOC sidebar
│   │   ├── SearchBar.jsx        # Fuzzy search UI
│   │   ├── ThemeToggle.jsx      # Dark/light toggle
│   │   └── ScrollToTop.jsx      # Back-to-top button
│   ├── hooks/
│   │   ├── useTheme.js          # Theme state + persistence
│   │   └── useSearch.js         # Fuse.js search logic
│   ├── utils/
│   │   ├── slugify.js           # Anchor ID generator
│   │   └── toc-generator.js     # TOC tree builder
│   ├── styles/
│   │   └── index.css            # All styles (dark/light, responsive)
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── index.html                   # HTML shell + SEO meta tags
├── vite.config.js
├── eslint.config.js
├── package.json
└── README.md
```

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

That's it — Vercel auto-detects Vite and builds correctly.

### Netlify

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Or connect the repo on Netlify and set:
- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages

1. Build: `npm run build`
2. Push the `dist/` folder to a `gh-pages` branch, or use a GitHub Action:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

> **Note:** For GitHub Pages subpath deployment, update `base` in `vite.config.js` to match your repo name (e.g. `base: '/awesome-hacking-site/'`).

## Tech Stack

- **Vite** — Fast build tool and dev server
- **React 18** — UI framework
- **marked** — Markdown parser
- **Fuse.js** — Fuzzy search engine

## License

Content belongs to the original [carpedm20/awesome-hacking](https://github.com/carpedm20/awesome-hacking) contributors. The website code is provided as-is for educational purposes.

---

## Author

**Built by Girish Lade** — founder of [LadeStack](https://ladestack.in), a free, open-source developer tools ecosystem.

- GitHub: [@girishlade111](https://github.com/girishlade111)
- Website: [ladestack.in](https://ladestack.in)
- Contact: admin@ladestack.in
