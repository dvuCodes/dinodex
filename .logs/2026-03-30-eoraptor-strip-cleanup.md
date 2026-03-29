## Summary

Removed detached frame-edge artifacts from the generated Eoraptor sprite strips after validating that the remaining "overlap" was coming from the strip PNGs themselves, not the playback renderer.

## Root Cause

- The renderer had already been updated to discrete whole-frame swaps.
- Inspection of `public/tamagotchi/001/adult-happy.png` showed the strip is `2064x512`, or `516px` per frame across 4 frames.
- Frame 2 still had a detached opaque island touching the left edge of the frame:
  - connected component size `1318`
  - bounding box `x=0..23`, `y=118..201`
- That meant the circled sliver was baked into the current frame image.

## Fix

- Added [repair-eoraptor-strips.ts](C:\Users\datvu\.codex\worktrees\4388\dinodex\scripts\repair-eoraptor-strips.ts).
- The repair pass:
  - scans each Eoraptor final strip,
  - splits it into 4 equal frames,
  - finds connected components in each frame,
  - keeps only the largest connected silhouette per frame,
  - rewrites the cleaned PNG in place.

## Repair Output

- `adult-happy.png`: removed `1560` stray pixels
- `adult-idle.png`: removed `1837` stray pixels
- `adult-sick.png`: removed `428` stray pixels
- `adult-sleepy.png`: removed `10135` stray pixels
- `hatchling-happy.png`: removed `2745` stray pixels
- `hatchling-idle.png`: removed `48` stray pixels
- `hatchling-sick.png`: removed `36` stray pixels
- `hatchling-sleepy.png`: removed `282` stray pixels
- `juvenile-happy.png`: removed `1214` stray pixels
- `juvenile-idle.png`: removed `1845` stray pixels
- `juvenile-sick.png`: removed `475` stray pixels
- `juvenile-sleepy.png`: removed `282` stray pixels

## Verification

- Re-checked the left edge of frame 2 in `adult-happy.png` after cleanup.
- Columns `x=516..527` now have `0` non-transparent pixels.
- Playwright on `http://localhost:3005/tamagotchi` confirms the app is loading `/tamagotchi/001/adult-happy.png` through the discrete frame-swap renderer.

## Notes

- Existing dev-console issues remain unchanged: the `/tamagotchi` hydration mismatch and missing `favicon.ico`.
- Existing repo-wide checks remain unchanged:
  - `bun run lint` still reports the pre-existing `react-hooks/refs` issues in `src/components/tamagotchi/TamagotchiGame.tsx`
  - `bunx tsc --noEmit` still reports missing `bun:test` type declarations across test files
