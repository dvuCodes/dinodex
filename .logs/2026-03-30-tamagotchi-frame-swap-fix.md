## Summary

Replaced the Tamagotchi strip playback with discrete frame-index swaps after the first playback fix still showed frame overlap in the live UI.

## Root Cause

- The first fix corrected the direction of sprite-strip travel, but the renderer still relied on a background-position animation inside `.pixel-screen`.
- In Playwright, the actual sprite viewport was `156px` wide because the parent had a `2px` border on each side.
- The animated sprite element had been sized for `160px`, then shrank as a flex item, which meant the frame-step math and visible viewport did not match.
- That mismatch let adjacent frames bleed and read as left-to-right overlap.

## Implementation

- Added a shared [PixelSprite.tsx](C:\Users\datvu\.codex\worktrees\4388\dinodex\src\components\tamagotchi\PixelSprite.tsx) renderer.
- The shared component now:
  - uses a clipped viewport,
  - renders the full strip at `frameCount * 100%`,
  - advances a `frameIndex` on an interval,
  - applies discrete `transform: translateX(...)` jumps with no CSS transition.
- Updated [DinoAvatar.tsx](C:\Users\datvu\.codex\worktrees\4388\dinodex\src\components\tamagotchi\DinoAvatar.tsx) and [EggCountdown.tsx](C:\Users\datvu\.codex\worktrees\4388\dinodex\src\components\tamagotchi\EggCountdown.tsx) to use the shared renderer.
- Simplified the related `.pixel-screen` / `.pixel-sprite` CSS in [globals.css](C:\Users\datvu\.codex\worktrees\4388\dinodex\src\app\globals.css).

## Verification

- `bun test src/lib/tamagotchi-sprites.test.ts`
- `bun run lint`
  - Still blocked only by the pre-existing `react-hooks/refs` issues in `src/components/tamagotchi/TamagotchiGame.tsx`
- Playwright on `http://localhost:3005/tamagotchi`
  - Seeded an adult happy Eoraptor run
  - Measured the viewport at `156px`
  - Measured the strip at `624px`
  - Sampled the live transform over time and observed exact jumps:
    - `0px`
    - `-156px`
    - `-312px`
    - `-468px`
  - Confirmed there were no fractional or interpolated positions between frames

## Notes

- The repo still has the existing `/tamagotchi` hydration mismatch and missing `favicon.ico` console errors during dev validation.
- `bunx tsc --noEmit` still reports the repo-wide missing `bun:test` type declarations across test files.
