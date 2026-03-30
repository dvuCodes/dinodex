# 2026-03-30 cleanup analysis

## Scope

Analyze Dinodex for:

- loose markdown files
- dead or weakly referenced code
- temporary and generated artifacts that are safe candidates for cleanup

No files were deleted or edited as part of this pass.

## Tracking

- Workspace: `C:/Users/datvu/.codex/worktrees/42b7/dinodex`
- Team: `Rio31`
- Issue status: no obvious existing Linear issue matched this cleanup pass during a quick search, so analysis proceeded without issue linkage

## Markdown inventory

Keep:

- `AGENTS.md`
- `CLAUDE.md`
- `PLAN.md`
- `README.md`
- `docs/**`
- `.logs/**`
- `.prompts/**`
- `.claude/skills/frontend-design/SKILL.md`

Reasoning:

- root process docs are actively referenced by repo workflow and logs
- `PLAN.md` is still relevant to the active tamagotchi workstream
- `.logs/` and `.prompts/` are required by repo instructions

## High-confidence cleanup candidates

- `.tmp-start-3002.err.log`
- `.tmp-start-3002.out.log`
- `.tmp-start-3005.err.log`
- `.tmp-start-3005.out.log`
- `.tmp-start.err.log`
- `.tmp-start.out.log`
- `test-results/.last-run.json`

These look like local run artifacts rather than source-of-truth files.

## Approved cleanup execution

User approved the `safe only` category.

Deleted:

- `.tmp-start-3002.err.log`
- `.tmp-start-3002.out.log`
- `.tmp-start-3005.err.log`
- `.tmp-start-3005.out.log`
- `.tmp-start.err.log`
- `.tmp-start.out.log`
- `test-results/.last-run.json`

Verification:

- confirmed each deleted path no longer exists in the worktree
- `git status --short` shows only the expected deletions plus this log file

## Likely dead code

- `src/components/StageSelector.tsx`
- `src/components/StatBar.tsx`

Both files currently have no inbound imports after resolving the repo `@/*` alias. `StatsPanel.tsx` now uses `SegmentedStatBar`, which appears to have replaced `StatBar`, and the detail page currently uses `StageEvolution` rather than `StageSelector`.

## Code-level unused symbols

Signals found from static analysis:

- `src/app/dino/[id]/DinoDetailClient.tsx`: imported `formatStageDexNumber` is unused
- `scripts/generate-tamagotchi-assets.ts`: `SOURCE_STAGES` is unused
- `scripts/edit-art-transparent.ts`: imported `rename` is unused
- `src/lib/tamagotchi.ts`: local helpers `inSleepWindow` and `countMissedSleepWindows` are unused

## Manual-review candidates

- `.superpowers/brainstorm/1736-1774780612/**`

These look like generated brainstorming session artifacts and are not part of runtime code, but they may have been intentionally committed as process history.

## Keep despite weak static signals

- `scripts/eoraptor-prototype.ts`: file is used by its test and CLI flow; only some exported surface area looks unconsumed
- `src/lib/data.ts#getDinosByEra`
- `src/lib/data.ts#getDinosByDiet`
- `src/lib/tamagotchi.ts` exports such as `applyAction`, `checkHatch`, `loadState`, `STORAGE_KEY`, `META_STORAGE_KEY`

Some of these are only referenced internally, in tests, or via reflective test helpers, so they should not be deleted from static grep results alone.
