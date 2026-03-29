## 2026-03-29 Filter Chip Static Hover (RIO-33)

- Goal: simplify homepage filter chip hover so it stays clearly clickable without any hover motion or animation.
- Root cause: `FilterChips.tsx` still used per-chip motion and transform-based hover behavior, which produced lift and scale on hover.
- Changes:
  - Removed per-chip `framer-motion` hover/tap behavior from `FilterChips.tsx`.
  - Kept a static hover affordance through background, text, and border color changes only.
  - Added a targeted Playwright assertion that chip hover keeps `transform: none`.
- Verification:
  - `bun run lint`
  - `PLAYWRIGHT_PORT=3000 bunx playwright test e2e/interaction-polish.spec.ts --grep "homepage controls are interactive by mouse and keyboard" --workers 1`
  - Browser check on `/` confirmed hover changes background/text/border while leaving `transform` and `boxShadow` unchanged.
