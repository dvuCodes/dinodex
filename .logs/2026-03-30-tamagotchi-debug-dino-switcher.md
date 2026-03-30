# 2026-03-30 Tamagotchi debug dino switcher

## Scope

Added a dev-only in-app debug control to switch the active Tamagotchi species without opening the hatchery flow.

## Changes

- Added [src/lib/tamagotchi-debug.ts](/C:/Users/datvu/.codex/worktrees/694a/dinodex/src/lib/tamagotchi-debug.ts) with a small environment gate for Tamagotchi-only debug UI.
- Added [src/lib/tamagotchi-debug.test.ts](/C:/Users/datvu/.codex/worktrees/694a/dinodex/src/lib/tamagotchi-debug.test.ts) covering dev/test enablement and production disablement.
- Updated [src/components/tamagotchi/TamagotchiGame.tsx](/C:/Users/datvu/.codex/worktrees/694a/dinodex/src/components/tamagotchi/TamagotchiGame.tsx) to render a debug-only inline switcher with:
  - species dropdown
  - `Switch Dino` button
  - immediate reset into a fresh egg for the selected species via the existing `createInitialState` and `commitState` path

## Behavior

- The debug switcher is visible only when `NODE_ENV !== "production"`.
- Switching species keeps the storage/update path consistent with normal adoption by reusing the existing selection handler.
- The control is intended for local validation of the animated sprite rollout and other Tamagotchi state work.

## Verification

- `bun test src/lib/tamagotchi-debug.test.ts`
- Playwright on `http://127.0.0.1:3000/tamagotchi`
  - confirmed the `Debug Dino Switcher` dropdown appears in dev
  - changed the active species from `#002 Coelophysis` to `#005 Postosuchus`
  - confirmed the header updated to `Postosuchus #005`
  - confirmed the run reset into an egg state with the expected incubation UI
