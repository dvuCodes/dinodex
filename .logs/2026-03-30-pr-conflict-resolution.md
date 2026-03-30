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
