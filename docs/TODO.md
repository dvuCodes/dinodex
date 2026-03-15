# DINODEX — Build TODO for Claude Code

> Feed this file to Claude Code to build the Dinodex app.
> Each task is atomic and ordered. Complete them sequentially.
> Reference: SPEC.md, DESIGN_SYSTEM.md, DATA_SCHEMA.md, ART_GENERATION.md

---

## Pre-read Instructions

Before starting any tasks, read these files in order to understand the full context:

1. `SPEC.md` — Product spec, features, technical architecture
2. `DESIGN_SYSTEM.md` — Colors, typography, components, animations, layouts
3. `DATA_SCHEMA.md` — TypeScript interfaces, sample data, utility functions
4. `ART_GENERATION.md` — Art pipeline (for placeholder strategy)

---

## Phase 1: Project Scaffolding ✅

### 1.1 ~~Initialize Next.js project~~ ✅
### 1.2 ~~Install dependencies~~ ✅
### 1.3 ~~Configure Tailwind~~ ✅
### 1.4 ~~Set up Google Fonts~~ ✅
### 1.5 ~~Set up global styles~~ ✅
### 1.6 ~~Create project structure~~ ✅

---

## Phase 2: Data Layer ✅

### 2.1 ~~Create TypeScript types~~ ✅
### 2.2 ~~Create constants~~ ✅
### 2.3 ~~Create utility functions~~ ✅
### 2.4 ~~Create the full dinosaur dataset~~ ✅
- ~~All 30 entries in `src/data/dinos.json` with 3 stages each~~
- ~~Scientifically accurate stats, engaging descriptions, fun facts~~
### 2.5 ~~Create data loader~~ ✅
- ~~Updated to import from `dinos.json`~~

---

## Phase 3: Placeholder Art ✅

### 3.1 ~~Create placeholder SVGs~~ ✅
- ~~`placeholder-hatchling.svg` — egg/baby silhouette, green tint~~
- ~~`placeholder-juvenile.svg` — action pose silhouette, amber tint~~
- ~~`placeholder-adult.svg` — powerful silhouette, red tint~~
### 3.2 ~~Create placeholder directory structure~~ ✅
- ~~`public/dinos/001/` through `public/dinos/030/` with stage SVGs~~

---

## Phase 4: Core Components ✅

### 4.1 ~~Build Header component~~ ✅
### 4.2 ~~Build DinoCard component~~ ✅
### 4.3 ~~Build SearchBar component~~ ✅
### 4.4 ~~Build FilterChips component~~ ✅
### 4.5 ~~Build StageSelector component~~ ✅
### 4.6 ~~Build StatBar component~~ ✅
### 4.7 ~~Build StatsPanel component~~ ✅
### 4.8 ~~Build DinoArt component~~ ✅
### 4.9 ~~Build DinoInfo component~~ ✅
### 4.10 ~~Build RelatedDinos component~~ ✅
### 4.11 ~~Build EmptyState component~~ ✅

> All components rebuilt with frontend-design skill: noise textures, scanline overlays,
> radial glow art backgrounds, sliding stage selector, era-accent borders, gradient
> logo, animated entrances, border glow hover effects, distinctive fun-fact cards.

---

## Phase 5: Custom Hook ✅

### 5.1 ~~Build useFilteredDinos hook~~ ✅
- ~~Search, era filter, diet filter with AND logic~~
- ~~URL param sync (read on mount, write on change)~~

---

## Phase 6: Pages ✅

### 6.1 ~~Build Home page~~ ✅
- ~~Server component + DinoGrid client wrapper~~
- ~~Responsive grid: 2-col / 3-col / 4-col~~
- ~~Staggered card entrance animation~~
- ~~Result count divider~~
### 6.2 ~~Build Dino Detail page~~ ✅
- ~~`generateStaticParams` for all 30 pages~~
- ~~Stage selector, stats, info, related dinos~~
- ~~Era-colored accent bar, asymmetric layout~~
### 6.3 ~~Add metadata~~ ✅
- ~~Dynamic titles and Open Graph per dino~~

---

## Phase 7: Animations & Polish ✅

### 7.1 ~~Add page transition animations~~ ✅
### 7.2 ~~Add card stagger animation on Home~~ ✅
### 7.3 ~~Add evolution stage transition~~ ✅
- ~~AnimatePresence crossfade, sparkle keyframes, stats re-animate~~
### 7.4 ~~Add stat bar spring animations~~ ✅
### 7.5 ~~Add hover effects~~ ✅
- ~~Card lift + border glow + image scale~~
### 7.6 Add loading state
- While images load, show a pulsing placeholder (Tailwind `animate-pulse`)
- Use Next.js Image `placeholder="blur"` where possible

---

## Phase 8: Responsive & Accessibility

### 8.1 Responsive testing
- Test all pages at 320px, 640px, 768px, 1024px, 1280px widths
- Fix any overflow, text truncation, or layout breaks
- Filter chips: ensure horizontal scroll works on mobile
- Detail page: stack all sections vertically on mobile
- Grid: verify 2-col → 3-col → 4-col transitions are smooth

### 8.2 Accessibility
- Add `alt` text to all dino art images: e.g. "Anime illustration of adult Tyrannosaurus Rex"
- Ensure all interactive elements are keyboard focusable
- Add `aria-label` to filter chips and stage buttons
- Ensure color is not the sole indicator (icons/text accompany color)
- Test tab navigation through home grid and detail page
- Add focus-visible styles (ring outline)

### 8.3 SEO
- Add `<title>` and `<meta description>` to all pages
- Add Open Graph `og:title`, `og:description`, `og:image` tags
- Use semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`
- Add JSON-LD structured data for each dino (optional, nice-to-have)

---

## Phase 9: Final Polish

### 9.1 Add favicon and OG image
- Create a simple dino-themed favicon (can be emoji-based initially)
- Create a static OG image for social sharing (1200×630)

### 9.2 Create README.md
- Project description
- Tech stack
- Getting started (npm install, npm run dev)
- Project structure overview
- How to add new dinosaurs
- How to generate art with Gemini
- Credits

### 9.3 Configure for deployment
- Ensure `next.config.ts` has:
  - Image domains configured (if any external)
  - Output: 'export' if doing full static, or default for Vercel
- Test `npm run build` succeeds with no errors
- Test `npm start` serves correctly

### 9.4 Final review
- Browse through all 30 dinos on home page
- Open each detail page, toggle all 3 stages
- Test search with various queries
- Test all filter combinations
- Check for visual consistency across different dinos
- Verify all stat values display correctly
- Confirm related dinos link correctly

---

## Completion Criteria

The app is considered MVP-complete when:
- [x] All 30 dinos display in the home grid with correct data
- [x] Search filters dinos by name instantly
- [x] Era and diet filter chips work correctly (AND logic)
- [x] Each dino detail page shows all 3 evolution stages
- [x] Stage selector changes art, stats, and description
- [x] Stat bars animate with spring physics
- [x] Page transitions and card hover effects work
- [ ] App is responsive from 320px to 1280px+
- [x] All images have alt text
- [ ] Keyboard navigation works throughout
- [x] `npm run build` succeeds with zero errors
- [ ] Lighthouse score is 90+ on all metrics (with placeholder art)
