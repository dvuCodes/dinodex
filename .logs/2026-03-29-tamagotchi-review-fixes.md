# 2026-03-29 Tamagotchi Review Fixes

## Scope
- [x] Fix multi-stage offline catch-up in `src/lib/tamagotchi.ts`
- [x] Fix overnight sleep penalties to use the actual elapsed interval
- [x] Keep soft-failed runs terminal until reset
- [x] Add regression tests for all three review findings

## Root Causes
- `simulateElapsedTime()` only evaluated one stage gate after reconciliation, so long offline intervals could leave an over-aged hatchling stuck at `juvenile` until a later tick.
- Sleep penalties checked the reopen timestamp instead of the missed interval, and the interval start was being overwritten before sleep evaluation.
- `runStatus` was treated as a purely derived value, so a failed run could flip back to `active` after a healing action.

## Fix Summary
- Added `advanceStageGates()` and used it in both reconciliation and action application.
- Added `countMissedSleepWindows()` and passed the pre-update timestamp into sleep consequence evaluation.
- Latched `soft-failed` status in derived state and ignored non-status actions once a run has failed.
- Added targeted regression coverage in `src/lib/tamagotchi.test.ts`.

## Verification
- `bun test ./src/lib/tamagotchi.test.ts`
- `bun test ./src/lib`
