# RIO-40 Debug Evolve Control

- Issue: `RIO-40`
- Goal: add a debug-only evolve control in the tamagotchi so artwork can be validated stage by stage without waiting for the simulation.

## Decisions

- Added a pure `evolveCurrentDino` helper in `src/lib/tamagotchi.ts` so debug stage forcing stays testable and separate from UI concerns.
- The debug control advances one step per click and stops at `adult`.
- `egg` debug evolution reuses the hatch transition so the first click produces a real hatchling state rather than a synthetic partial state.

## Checklist

- [x] Add a one-step evolve helper for tamagotchi state.
- [x] Expose a debug-only evolve button in the tamagotchi shell.
- [x] Cover the helper with unit tests.
- [x] Run targeted verification and capture results.

## Verification

- `bun test src/lib/tamagotchi.test.ts`
- `bun test src/lib/review-fixes.test.ts`
- `PLAYWRIGHT_PORT=3000 bunx playwright test e2e/interaction-polish.spec.ts --grep "debug evolve advances the current dino by one stage"`

## Notes

- Verified against the existing listener on port `3000`, owned by `node.exe scripts/dev-server.mjs`, which matches this repo's custom dev server.
- The transient hatch celebration copy is not stable enough for browser assertions, so the Playwright smoke test checks the debug feedback, `hatchling` badge, and active pixel sprite instead.
