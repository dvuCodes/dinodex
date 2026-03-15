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
- ~~In `src/app/layout.tsx`, load Google Fonts:~~
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

## Phase 2: Data Layer

### 2.1 ~~Create TypeScript types~~ ✅
- ~~Create `src/lib/types.ts` with all interfaces from DATA_SCHEMA.md section 1~~
- ~~Export: `Era`, `Diet`, `Locomotion`, `Stage`, `DinoStage`, `DinoEntry`~~

### 2.2 ~~Create constants~~ ✅
- ~~Create `src/lib/constants.ts` with all color maps from DATA_SCHEMA.md section 2~~
- ~~Export: `ERA_COLORS`, `DIET_COLORS`, `STAGE_COLORS`, `STAT_COLORS`, `STAT_MAXES`~~

### 2.3 ~~Create utility functions~~ ✅
- ~~Create `src/lib/utils.ts` with all helpers from DATA_SCHEMA.md section 4~~
- ~~Export: `formatDexNumber`, `formatWeight`, `formatMeters`, `formatSpeed`, `getStatPercent`, `getArtPath`~~

### 2.4 Create the full dinosaur dataset
- Create `src/data/dinos.json` with all 30 dinosaur entries
- Use the 3 sample entries in DATA_SCHEMA.md section 3 as the template
- Every entry needs complete data for all 3 stages (hatchling, juvenile, adult)
- Ensure stats are scientifically plausible and scale appropriately per stage
- Write engaging, educational descriptions for each stage
- Fun facts should be genuinely interesting and accurate
- Set `relatedIds` to connect dinos of same era or taxonomic family
- Use the dinosaur roster from SPEC.md section 5 for the full list of 30
- IMPORTANT: Take time with this — the data quality IS the product

### 2.5 ~~Create data loader~~ ✅
- ~~Create `src/lib/data.ts`:~~
  - ~~`getAllDinos(): DinoEntry[]` — returns all 30~~
  - ~~`getDinoById(id: number): DinoEntry | undefined` — single lookup~~
  - ~~`getDinosByEra(era: Era): DinoEntry[]` — filtered by era~~
  - ~~`getDinosByDiet(diet: Diet): DinoEntry[]` — filtered by diet~~
  - ~~`getRelatedDinos(dino: DinoEntry): DinoEntry[]` — looks up relatedIds~~
- ~~Import and type-assert from `dinos.json`~~

---

## Phase 3: Placeholder Art

### 3.1 Create placeholder SVGs
- Create 3 placeholder SVG files in `public/dinos/`:
  - `placeholder-hatchling.svg` — small cute dino egg/baby silhouette, green tint
  - `placeholder-juvenile.svg` — medium dino silhouette in action pose, amber tint
  - `placeholder-adult.svg` — large powerful dino silhouette, red tint
- These are used until real Gemini art is generated
- Simple, clean, works at any size

### 3.2 Create placeholder directory structure
- Create directories `public/dinos/001/` through `public/dinos/030/`
- In each, symlink or copy the stage-appropriate placeholder SVG
- This way the app can reference `/dinos/001/adult.webp` and gracefully fall back

---

## Phase 4: Core Components

### 4.1 Build Header component
- `src/components/Header.tsx`
- Fixed/sticky at top
- Logo: "DINODEX" in display font (M PLUS Rounded, 900 weight)
- Subtitle: "Dinosaur Encyclopedia" in body font, muted
- Subtle bottom border
- Height: 64px
- Add a small dino emoji or SVG icon next to the logo

### 4.2 Build DinoCard component
- `src/components/DinoCard.tsx`
- Props: `dino: DinoEntry`
- Layout per DESIGN_SYSTEM.md section 4.1
- Shows: dex number (#001), art image (adult stage), name, diet label with emoji, era label
- Border color: mapped from dino's diet using DIET_COLORS
- Background: white card with subtle shadow
- Next.js `<Image>` component for the art (with placeholder fallback)
- Entire card is a `<Link>` to `/dino/[id]`
- Framer Motion: `whileHover` for lift effect, `initial/animate` for entrance

### 4.3 Build SearchBar component
- `src/components/SearchBar.tsx`
- Controlled input with `value` and `onChange` props
- Placeholder: "Search dinosaurs..."
- Clear button (×) shown when text is present
- Debounced: 150ms before filtering
- Styled: rounded, subtle border, focus ring
- Search icon (left side, use SVG or Unicode)

### 4.4 Build FilterChips component
- `src/components/FilterChips.tsx`
- Props: active filters, onChange handlers
- Two groups: Era chips and Diet chips
- Horizontal scrollable container (overflow-x-auto, hide scrollbar)
- Active chip: filled background with white text
- Inactive chip: outlined, muted text
- Each group has an "All" chip that resets that filter
- Pill shape (border-radius: 9999px)
- Per DESIGN_SYSTEM.md section 4.4

### 4.5 Build StageSelector component
- `src/components/StageSelector.tsx`
- Props: `activeStage: Stage`, `onStageChange: (stage: Stage) => void`
- 3 pill buttons: "🥚 Hatchling", "⚡ Juvenile", "🔥 Adult"
- Active: filled with stage color, white text, subtle shadow
- Inactive: outlined with stage color, transparent background
- Framer Motion: `layout` animation on the active indicator
- Scale bounce on click

### 4.6 Build StatBar component
- `src/components/StatBar.tsx`
- Props: `label: string`, `value: number`, `max: number`, `color: string`, `unit: string`, `delay?: number`
- Layout per DESIGN_SYSTEM.md section 4.3
- Label on left, bar in center, formatted value on right
- Framer Motion: animate bar width from 0 to target percentage
- Spring animation: `spring({ stiffness: 100, damping: 15 })`
- Staggered delay prop for sequential animation

### 4.7 Build StatsPanel component
- `src/components/StatsPanel.tsx`
- Props: `stage: DinoStage`, `animationKey: string`
- Renders 6 StatBar components: height, length, weight, speed, danger, defense
- Uses `STAT_MAXES` and `STAT_COLORS` from constants
- Formats values using utility functions
- `animationKey` changes when stage changes, triggering re-animation

### 4.8 Build DinoArt component
- `src/components/DinoArt.tsx`
- Props: `dinoId: number`, `stage: Stage`, `eraColor: string`
- Displays the dino art image for the given stage
- Background gradient using the era color
- Framer Motion `AnimatePresence` for crossfade between stages
- Large Pokédex number overlay (semi-transparent)
- Next.js `<Image>` with priority loading, blur placeholder
- Aspect ratio: 4:3 container

### 4.9 Build DinoInfo component
- `src/components/DinoInfo.tsx`
- Props: `dino: DinoEntry`, `stage: Stage`
- Card/panel showing: Era + period, Region, Type, Diet, Locomotion, Discovered by
- Fun fact / description text (changes per stage)
- Diet emoji next to diet name
- Clean layout with labeled rows

### 4.10 Build RelatedDinos component
- `src/components/RelatedDinos.tsx`
- Props: `relatedIds: number[]`, `currentId: number`
- Horizontal scrollable row of mini DinoCards
- Each links to that dino's detail page
- Smaller card variant (just art + name)

### 4.11 Build EmptyState component
- `src/components/EmptyState.tsx`
- Friendly message when filters return 0 results
- "No dinosaurs found. Try different filters!"
- Optional: small dino illustration/emoji

---

## Phase 5: Custom Hook

### 5.1 Build useFilteredDinos hook
- `src/hooks/useFilteredDinos.ts`
- Input: full dinos array
- State: `searchQuery`, `eraFilter`, `dietFilter`
- Returns: filtered dinos array + setter functions
- Search: case-insensitive match on `name`
- Era filter: match on `era` field (or "all" for no filter)
- Diet filter: match on `diet` field (or "all" for no filter)
- Filters combine with AND logic
- URL sync: read/write query params (`?era=jurassic&diet=carnivore`)

---

## Phase 6: Pages

### 6.1 Build Home page
- `src/app/page.tsx`
- Server component that loads all dinos data
- Renders a client component wrapper (`DinoGrid`) that handles:
  - Header
  - SearchBar
  - FilterChips
  - Grid of DinoCards
  - EmptyState when no results
- Grid: responsive columns using CSS Grid
  - Mobile (default): 2 columns
  - md: 3 columns
  - lg: 4 columns
  - gap: 16px, padding: 16px
- Max-width container: 1200px, centered
- Framer Motion: stagger children on initial load
- Layout per DESIGN_SYSTEM.md section 5.1

### 6.2 Build Dino Detail page
- `src/app/dino/[id]/page.tsx`
- Use `generateStaticParams` to pre-generate all 30 pages at build time
- Server component loads dino data by ID
- Client component wrapper handles:
  - Back navigation link
  - DinoArt (hero section)
  - Name, meaning, pronunciation
  - StageSelector
  - StatsPanel
  - DinoInfo
  - RelatedDinos
- `useState` for active stage (default: "adult")
- Stage change updates: art, stats, description, diet detail
- Layout per DESIGN_SYSTEM.md section 5.2
- Framer Motion: page entrance animation

### 6.3 Add metadata
- Home page: title "Dinodex — Dinosaur Encyclopedia", description
- Detail pages: dynamic title per dino, e.g. "Tyrannosaurus Rex | Dinodex #018"
- Open Graph metadata for social sharing

---

## Phase 7: Animations & Polish

### 7.1 Add page transition animations
- Wrap page content in Framer Motion `motion.div`
- Fade in on mount: `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`
- Subtle slide up: `initial={{ y: 20 }}`
- Duration: 300ms

### 7.2 Add card stagger animation on Home
- DinoGrid: use Framer Motion `staggerChildren: 0.03` on the grid container
- Each DinoCard: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- This creates a cascading reveal effect

### 7.3 Add evolution stage transition
- In DinoArt: `AnimatePresence` mode="wait" for crossfade
  - Exit: `opacity: 0`, `scale: 0.95`, duration 200ms
  - Enter: `opacity: 1`, `scale: 1`, duration 300ms
- Add CSS sparkle effect at transition midpoint (optional, CSS keyframes)
- Stats re-animate via `key` prop change on StatsPanel

### 7.4 Add stat bar spring animations
- Each StatBar animates its fill width with Framer Motion spring
- Stagger: 60ms delay between each bar
- Re-triggers when stage changes (via `key` prop)
- Spring config: `{ stiffness: 100, damping: 15 }`

### 7.5 Add hover effects
- DinoCard: `whileHover={{ y: -4, transition: { duration: 0.2 } }}`
- Also increase shadow on hover via CSS transition
- Border glow effect (box-shadow with diet color, low opacity)
- Filter chips: background color on hover

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
- [ ] All 30 dinos display in the home grid with correct data
- [ ] Search filters dinos by name instantly
- [ ] Era and diet filter chips work correctly (AND logic)
- [ ] Each dino detail page shows all 3 evolution stages
- [ ] Stage selector changes art, stats, and description
- [ ] Stat bars animate with spring physics
- [ ] Page transitions and card hover effects work
- [ ] App is responsive from 320px to 1280px+
- [ ] All images have alt text
- [ ] Keyboard navigation works throughout
- [ ] `npm run build` succeeds with zero errors
- [ ] Lighthouse score is 90+ on all metrics (with placeholder art)
