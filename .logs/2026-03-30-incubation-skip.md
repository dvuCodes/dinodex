## Context

- Added an in-app testing shortcut to skip the Tamagotchi egg incubation timer while the feature is still under active iteration.
- Kept the scope limited to the existing egg state flow instead of adding a broader debug mode or route-level override.

## Changes

- Added `skipIncubation(state, now)` to `src/lib/tamagotchi.ts`.
- The helper only mutates active egg runs and otherwise returns the incoming state unchanged.
- Reused the existing hatch transition so the shortcut clears egg timing fields and lands directly in the hatchling state.

## Verification

- `bun test src/lib/tamagotchi.test.ts`
- `bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-art-pipeline.test.ts scripts/eoraptor-prototype.test.ts`
- Headless Playwright smoke check against `http://localhost:3005/tamagotchi`:
  - open Tamagotchi route
  - choose `Eoraptor`
  - confirm `Skip incubation` is visible on the egg screen
  - click `Skip incubation`
  - confirm the run switches to `HATCHLING` and the skip button is removed
