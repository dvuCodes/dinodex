## 2026-03-29 Dinodex interaction-system polish

- Linear project: `Dinodex: Tamagotchi Overhaul`
- Active issues: `RIO-26`, `RIO-27`, `RIO-28`, `RIO-29`
- Scope: add a shared shadcn-style button primitive, migrate header and tamagotchi controls, normalize hover and `focus-visible` affordances across homepage and detail interactions, and add targeted Playwright coverage.
- Constraints: preserve the current playful Dinodex visual language, avoid layout redesign, and keep reduced-motion affordance readable without relying on animation.
- Existing repo state note: `next-env.d.ts` had a pre-existing modification and is not part of this task.
- Implementation approach: parallelize into three disjoint workstreams
  - shared button plus tamagotchi/header adoption
  - dex/detail interaction sweep
  - Playwright interaction tests
- Verification evidence:
  - `PLAYWRIGHT_PORT=3002 bunx playwright test e2e/interaction-polish.spec.ts` -> `2 passed`
  - `bun run lint` -> passed
  - `PLAYWRIGHT_PORT=3002 bunx playwright test` -> `21 passed`
  - `bunx playwright test` with the new default isolated port -> `21 passed`
  - manual browser smoke on `http://127.0.0.1:3002/` and `http://127.0.0.1:3002/tamagotchi` showed no console errors and successful selector open/focus behavior
