## Summary

Added an in-app incubation skip path for Tamagotchi testing so an active egg can hatch immediately without waiting for the countdown.

## Decisions

- Kept the hatch shortcut as a pure state helper in `src/lib/tamagotchi.ts` via `skipIncubation(state, now)`.
- Limited the UI affordance to the egg screen in `src/components/tamagotchi/TamagotchiGame.tsx`.
- Reused the existing hatch transition semantics: the egg state is replaced with a hatchling state, persisted to storage, and the existing hatch feedback banner is shown.

## Verification

- `bun test src/lib/tamagotchi.test.ts`
- `bun run lint`
- `bunx tsc --noEmit`
  - Still fails on the repo's existing missing `bun:test` ambient type declarations across test files; no new feature-specific type errors remained after removing a duplicate `skipIncubation` export.
- Playwright on `http://localhost:3005/tamagotchi`
  - Reset the current run
  - Started a fresh Eoraptor egg
  - Confirmed the egg screen showed `Skip incubation`
  - Clicked the new control and observed the UI switch to hatchling controls immediately
  - Confirmed `localStorage["dinodex-tamagotchi"]` changed to `stage: "hatchling"` with `eggStartTime: null` and `hatchDurationMs: null`

## Notes

- The dev route still reports the existing hydration mismatch and missing `favicon.ico` console errors. Those were present during this verification pass and are outside this change.
