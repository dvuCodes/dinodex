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
- ~~Create new Next.js 15 project with App Router, TypeScript, Tailwind CSS v4, ESLint~~
- ~~Project name: `dinodex`~~
- ~~Use `src/` directory structure~~
- ~~Enable Turbopack for dev~~

### 1.2 ~~Install dependencies~~ ✅
- ~~`framer-motion` — animations (card transitions, stat bars, page transitions)~~
- ~~`next` (already included)~~
- ~~No other runtime deps needed — keep it lean~~

### 1.3 ~~Configure Tailwind~~ ✅
- ~~Set up Tailwind CSS v4 with custom theme via `@theme` in `globals.css`~~
- ~~Add custom colors: era colors, diet colors, stage colors, stat colors, UI base colors~~
- ~~Add custom font families: display, body, mono~~
- ~~Add custom border-radius: card (16px), pill (9999px)~~
- ~~Add custom animations: sparkle, bar-fill~~

### 1.4 ~~Set up Google Fonts~~ ✅
- ~~In `src/app/layout.tsx`, load Google Fonts via `next/font/google`:~~
  - ~~`M PLUS Rounded 1c` weights: 400, 700, 900~~
  - ~~`Noto Sans` weights: 400, 500, 700~~
  - ~~`JetBrains Mono` weight: 500~~
- ~~Apply via CSS variables: `--font-display`, `--font-body`, `--font-mono`~~
- ~~Set body font to Noto Sans, background to cream (#FFFBF0)~~

### 1.5 ~~Set up global styles~~ ✅
- ~~In `src/app/globals.css`:~~
  - ~~Set background color: `#FFFBF0` (warm cream)~~
  - ~~Set default text color: `#1C1917`~~
  - ~~Add smooth scrolling: `html { scroll-behavior: smooth }`~~
  - ~~Add selection color styling~~
  - ~~Import Tailwind directives~~
  - ~~Added Pokédex scanline overlay, card glow utility, shimmer effect~~

### 1.6 ~~Create project structure~~ ✅
- ~~Create all directories per SPEC.md section 4.2:~~
  - ~~`src/components/`~~
  - ~~`src/data/`~~
  - ~~`src/lib/`~~
  - ~~`src/hooks/`~~
  - ~~`src/app/dino/[id]/`~~
  - ~~`public/dinos/` (empty for now)~~
  - ~~`scripts/`~~

---

## Phase 2: Data Layer ✅

### 2.1 ~~Create TypeScript types~~ ✅
- ~~Create `src/lib/types.ts` with all interfaces from DATA_SCHEMA.md section 1~~
- ~~Export: `Era`, `Diet`, `Locomotion`, `Stage`, `DinoStage`, `DinoEntry`~~

### 2.2 ~~Create constants~~ ✅
- ~~Create `src/lib/constants.ts` with all color maps from DATA_SCHEMA.md section 2~~
- ~~Export: `ERA_COLORS`, `DIET_COLORS`, `STAGE_COLORS`, `STAT_COLORS`, `STAT_MAXES`~~

### 2.3 ~~Create utility functions~~ ✅
- ~~Create `src/lib/utils.ts` with all helpers from DATA_SCHEMA.md section 4~~
- ~~Export: `formatDexNumber`, `formatWeight`, `formatMeters`, `formatSpeed`, `getStatPercent`, `getArtPath`~~

### 2.4 ~~Create the full dinosaur dataset~~ ✅
- ~~Create `src/data/dinos.json` with all 30 dinosaur entries~~
- ~~Every entry has complete data for all 3 stages (hatchling, juvenile, adult)~~
- ~~Stats are scientifically plausible and scale appropriately per stage~~
- ~~Engaging, educational descriptions for each stage~~
- ~~Fun facts are interesting and accurate~~
- ~~`relatedIds` connect dinos of same era or taxonomic family~~

### 2.5 ~~Create data loader~~ ✅
- ~~Create `src/lib/data.ts`:~~
  - ~~`getAllDinos(): DinoEntry[]` — returns all 30~~
  - ~~`getDinoById(id: number): DinoEntry | undefined` — single lookup~~
  - ~~`getDinosByEra(era: Era): DinoEntry[]` — filtered by era~~
  - ~~`getDinosByDiet(diet: Diet): DinoEntry[]` — filtered by diet~~
  - ~~`getRelatedDinos(dino: DinoEntry): DinoEntry[]` — looks up relatedIds~~
- ~~Import and type-assert from `dinos.json`~~

---

## Phase 3: Placeholder Art ✅

### 3.1 ~~Create placeholder SVGs~~ ✅
- ~~Create 3 placeholder SVG files in `public/dinos/`:~~
  - ~~`placeholder-hatchling.svg` — small cute dino egg/baby silhouette, green tint~~
  - ~~`placeholder-juvenile.svg` — medium dino silhouette in action pose, amber tint~~
  - ~~`placeholder-adult.svg` — large powerful dino silhouette, red tint~~

### 3.2 ~~Create placeholder directory structure~~ ✅
- ~~Create directories `public/dinos/001/` through `public/dinos/030/`~~
- ~~Each directory has stage-appropriate SVG placeholders (hatchling.svg, juvenile.svg, adult.svg)~~

---

## Phase 4: Core Components ✅

### 4.1 ~~Build Header component~~ ✅
- ~~`src/components/Header.tsx`~~
- ~~Fixed/sticky at top with backdrop blur~~
- ~~Logo: "DINODEX" in display font with gradient text~~
- ~~Subtitle: "Dinosaur Encyclopedia" in body font, muted~~
- ~~Gradient bottom border (era colors)~~
- ~~Dino emoji icon with spring animation~~

### 4.2 ~~Build DinoCard component~~ ✅
- ~~`src/components/DinoCard.tsx`~~
- ~~Diet-colored border, era-colored art background~~
- ~~Dex number, diet badge, art image, name, era label~~
- ~~Framer Motion variants for stagger animation + hover lift~~
- ~~Card glow effect on hover~~

### 4.3 ~~Build SearchBar component~~ ✅
- ~~`src/components/SearchBar.tsx`~~
- ~~SVG search icon, clear button, focus ring~~
- ~~Accessible with aria-label~~

### 4.4 ~~Build FilterChips component~~ ✅
- ~~`src/components/FilterChips.tsx`~~
- ~~Era and Diet groups with labels~~
- ~~Active/inactive chip styles~~
- ~~Pill shape, scrollable, accessible~~

### 4.5 ~~Build StageSelector component~~ ✅
- ~~`src/components/StageSelector.tsx`~~
- ~~3 pill buttons with layout animation for active indicator~~
- ~~Stage colors, accessible~~

### 4.6 ~~Build StatBar component~~ ✅
- ~~`src/components/StatBar.tsx`~~
- ~~Spring-animated fill width~~
- ~~Shimmer overlay effect~~

### 4.7 ~~Build StatsPanel component~~ ✅
- ~~`src/components/StatsPanel.tsx`~~
- ~~6 stat bars with staggered delay~~
- ~~Re-animates on stage change via key prop~~

### 4.8 ~~Build DinoArt component~~ ✅
- ~~`src/components/DinoArt.tsx`~~
- ~~AnimatePresence crossfade between stages~~
- ~~Era-colored gradient background~~
- ~~Dex number watermark and badge~~
- ~~Scanline overlay~~

### 4.9 ~~Build DinoInfo component~~ ✅
- ~~`src/components/DinoInfo.tsx`~~
- ~~Classification card with era accent stripe~~
- ~~Stage description with crossfade animation~~
- ~~Fun fact section with gradient background~~

### 4.10 ~~Build RelatedDinos component~~ ✅
- ~~`src/components/RelatedDinos.tsx`~~
- ~~Horizontal scrollable mini cards~~
- ~~Staggered entrance animation~~

### 4.11 ~~Build EmptyState component~~ ✅
- ~~`src/components/EmptyState.tsx`~~
- ~~Animated bone emoji, friendly message~~
- ~~Pulsing dots indicator~~

---

## Phase 5: Custom Hook ✅

### 5.1 ~~Build useFilteredDinos hook~~ ✅
- ~~`src/hooks/useFilteredDinos.ts`~~
- ~~Search, era filter, diet filter with AND logic~~
- ~~URL query params sync~~

---

## Phase 6: Pages ✅

### 6.1 ~~Build Home page~~ ✅
- ~~`src/app/page.tsx` — Server component, loads dinos~~
- ~~`src/components/DinoGrid.tsx` — Client wrapper with filters and grid~~
- ~~Responsive grid: 2 → 3 → 4 columns~~
- ~~Staggered card entrance animation~~
- ~~Species count display~~

### 6.2 ~~Build Dino Detail page~~ ✅
- ~~`src/app/dino/[id]/page.tsx` — Server component with generateStaticParams~~
- ~~`src/app/dino/[id]/DinoDetailClient.tsx` — Client wrapper~~
- ~~Desktop: 2-column layout (art left, info right)~~
- ~~Stage selector, stats panel, info section, related dinos~~
- ~~Page entrance animation~~

### 6.3 ~~Add metadata~~ ✅
- ~~Home: "Dinodex — Dinosaur Encyclopedia"~~
- ~~Detail: dynamic per dino with OG tags~~

---

## Phase 7: Animations & Polish ✅

### 7.1 ~~Add page transition animations~~ ✅
### 7.2 ~~Add card stagger animation on Home~~ ✅
### 7.3 ~~Add evolution stage transition~~ ✅
### 7.4 ~~Add stat bar spring animations~~ ✅
### 7.5 ~~Add hover effects~~ ✅
### 7.6 ~~Add loading state~~ ✅

---

## Phase 8: Responsive & Accessibility ✅

### 8.1 ~~Responsive~~ ✅
- ~~Responsive grid, stacked detail on mobile, horizontal scroll on chips~~

### 8.2 ~~Accessibility~~ ✅
- ~~Alt text on all images, aria-labels, aria-pressed, keyboard focusable~~
- ~~Focus-visible ring styles~~

### 8.3 ~~SEO~~ ✅
- ~~Title, description, OG tags on all pages~~
- ~~Semantic HTML (main, section, header)~~

---

## Phase 9: Final Polish ✅

### 9.1 ~~Add favicon and OG image~~ ✅
- ~~Create a simple dino-themed favicon (can be emoji-based initially)~~
- ~~Create a static OG image for social sharing (1200×630)~~

### 9.2 ~~Create README.md~~ ✅
- ~~Project description~~
- ~~Tech stack~~
- ~~Getting started (bun install, bun run dev)~~
- ~~Project structure overview~~
- ~~How to add new dinosaurs~~
- ~~How to generate art with Gemini~~
- ~~Credits~~

### 9.3 ~~Configure for deployment~~ ✅
- ~~Ensure `next.config.ts` has correct configuration~~
- ~~Test `bun run build` succeeds with no errors~~ ✅
- ~~Test `bun start` serves correctly~~ ✅

### 9.4 ~~Final review~~ ✅
- ~~Browse through all 30 dinos on home page~~
- ~~Open each detail page, toggle all 3 stages~~
- ~~Test search with various queries~~
- ~~Test all filter combinations~~
- ~~Check for visual consistency across different dinos~~
- ~~Verify all stat values display correctly~~
- ~~Confirm related dinos link correctly~~

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
- [x] App is responsive from 320px to 1280px+
- [x] All images have alt text
- [x] Keyboard navigation works throughout
- [x] `bun run build` succeeds with zero errors
- [x] Lighthouse score is 90+ on all metrics (with placeholder art)
