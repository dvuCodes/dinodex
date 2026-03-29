# Tamagotchi Overhaul Plan

## Summary
Replace the existing `/tamagotchi` mode with a classic-pressure virtual pet in a pocket-device shell. Keep mechanics deterministic and client-side, use slower web-friendly real-time decay, and make care quality drive sickness, mess, discipline, sleep compliance, branching growth, and soft-failure outcomes.

## Workstreams
### Simulation
- Refactor `src/lib/tamagotchi.ts` into a versioned deterministic simulation.
- Add `simulateElapsedTime(state, now)` and `applyPlayerAction(state, action, now)` as the main domain API.
- Introduce explicit active-run and meta-progression saves, plus legacy save migration.
- Model attention, sleep windows, poop/mess, sickness, care mistakes, care quality, and deterministic branching outcomes.

### UI
- Rebuild `src/app/tamagotchi/page.tsx` and `src/components/tamagotchi/*` into a pocket-device shell.
- Replace the current 3-stat/3-action presentation with config-driven controls and condition indicators.
- Keep the route accessible and responsive on mobile and desktop.

### Verification and Docs
- Create a dated log under `.logs/`.
- Save any `nano-banana-2` prompts under `.prompts/`.
- Update `AGENTS.md` to state that `bun` is the default package manager.
- Add tamagotchi-focused Playwright coverage for adoption, core controls, condition indicators, and reload persistence.

## Acceptance Criteria
- Legacy saves migrate into the new versioned simulation state.
- The pet responds to offline catch-up deterministically.
- The route presents a pocket-device shell with the expanded care loop.
- Browser coverage exists for the adoption flow, core controls, condition indicators, and reload persistence.

## Assumptions
- The overhaul replaces the existing tamagotchi route in place.
- Core gameplay remains deterministic and non-AI in this implementation.
- `bun` is the authoritative package manager going forward.

