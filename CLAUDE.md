# CLAUDE.md — Dinodex Build Instructions

> This file tells Claude Code how to work on this project.

## Project Overview
Dinodex is a Pokédex-style dinosaur encyclopedia web app. Anime-styled art, 30 curated dinosaurs, 3 evolution stages per dino (Hatchling → Juvenile → Adult), fun and engaging UI.

## Tech Stack
- **Framework:** Next.js 15, App Router, TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Animation:** Framer Motion for page transitions, stat bars, card hover
- **Data:** Static JSON (src/data/dinos.json), no backend
- **Fonts:** M PLUS Rounded 1c (display), Noto Sans (body), JetBrains Mono (mono)
- **Deployment:** Vercel (static export)

## Key Docs (read before building)
- `SPEC.md` — Full product spec with features, routes, architecture
- `DESIGN_SYSTEM.md` — Colors, typography, component specs, animation specs
- `DATA_SCHEMA.md` — TypeScript interfaces, constants, sample dino entries, utilities
- `ART_GENERATION.md` — Gemini art pipeline and placeholder strategy
- `TODO.md` — Structured build task list (follow this sequentially)

## Build Commands
```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # Lint check
```

## Code Style
- Use TypeScript strict mode
- Prefer named exports
- Components: one component per file, PascalCase filenames
- Use `"use client"` directive only when needed (interactivity, hooks)
- Server Components by default for data loading
- Tailwind for all styling — avoid inline styles and CSS modules
- Framer Motion for all animations — avoid raw CSS animations except where Framer is overkill (like simple hover states)

## Design Principles
- **Anime Pokédex aesthetic** — playful, colorful, collectible
- **Mobile-first** — design for 320px, enhance up
- **No AI slop** — distinctive fonts, intentional colors, personality in every component
- **Performance** — all 30 pages statically generated, images optimized
- **Data quality** — dinosaur facts should be scientifically accurate and engaging

## File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Home grid page
│   ├── globals.css         # Tailwind + custom styles
│   └── dino/[id]/page.tsx  # Dino detail page
├── components/             # All React components
├── data/dinos.json         # 30 dino entries
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── constants.ts        # Color maps, stat maxes
│   ├── utils.ts            # Formatting helpers
│   └── data.ts             # Data loader functions
└── hooks/
    └── useFilteredDinos.ts # Search + filter hook
```

## Important Notes
- Art images are NOT available yet — use placeholder SVGs (see ART_GENERATION.md section 6)
- The app must work fully with placeholders — art generation is a separate step
- dinos.json is the core of the product — spend time making descriptions engaging
- Stats should scale realistically across stages (hatchling << juvenile << adult)
- Some exceptions: speed can be higher for juveniles (e.g., juvenile T. Rex was faster than adult)
