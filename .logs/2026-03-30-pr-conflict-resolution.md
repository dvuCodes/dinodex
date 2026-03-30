## 2026-03-30 PR conflict resolution

- Goal: resolve the PR conflicts against `origin/main` in `AGENTS.md` and `src/components/tamagotchi/TamagotchiGame.tsx`.
- Resolution:
  - merged the stronger Linear workflow requirements in `AGENTS.md` into one rule covering both start-of-work issue linkage and end-of-work status/verification updates
  - kept the shared `Button` system changes from `origin/main`
  - preserved the dev-only Tamagotchi debug dino switcher from `codex/sprite-design`
  - cleaned up `TamagotchiGame.tsx` to satisfy current lint rules by replacing ref-based initialization with a stable state initializer and removing the state-setting effect for `debugSpeciesId`
- Verification:
  - `bun run lint`
  - `bun test src/lib/tamagotchi-sprites.test.ts`
  - Playwright smoke on `http://127.0.0.1:3000/tamagotchi` confirmed the route rendered `Dino Care` and `Choose Your Dino` with no console warnings/errors captured during load

## Follow-up merge against newer main

- `origin/main` advanced again after the first conflict-resolution push and introduced a new hydration-safe initialization change in `TamagotchiGame.tsx`.
- Resolved the new conflict by keeping:
  - the hydration-safe `null` initial render plus post-mount storage reconciliation from `origin/main`
  - this branch's debug dino switcher and one-step debug evolve control
- Accepted `origin/main` cleanup deletions for stale temp startup logs and `test-results/.last-run.json`.
- Additional verification:
  - `bun run lint`
  - `bun test src/components/tamagotchi/TamagotchiGame.hydration.test.tsx src/lib/tamagotchi.test.ts src/lib/tamagotchi-sprites.test.ts`
  - Playwright smoke on `http://127.0.0.1:3000/tamagotchi` confirmed the landing shell still renders cleanly with no captured console warnings/errors
