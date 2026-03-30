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
- [ ] Run targeted verification and capture results.
