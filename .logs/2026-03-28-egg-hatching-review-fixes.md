## 2026-03-28 Egg Hatching Review Fixes

- Fixed `/dex` canonical redirect to preserve active `era`, `diet`, and `q` query params while redirecting to `/`.
- Added small routing helper coverage for the preserved redirect target.
- Removed the egg timer ref race by synchronizing `stateRef.current` before React state updates in the tamagotchi flow.
- Restored repeated same-action avatar feedback by keying the floating action bubble from `lastActionTime` instead of a stable component id.
- Verification run:
  - `bun test src/lib/review-fixes.test.ts`
  - `bunx playwright test e2e/route-integrity.spec.ts`
  - `bun run lint`
  - `bun run build`
