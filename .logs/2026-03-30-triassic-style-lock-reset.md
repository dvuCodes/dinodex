# 2026-03-30 triassic Tamagotchi style-lock reset

Related issue: `RIO-40`

## Scope

Task 2 refactors the rollout pipeline for the full-reset pass so species #003, #004, #005 regenerate fresh anchors under the approved #001-#002 style-lock family instead of copying shipped stage sprites.

## Decisions

- The rollout CLI now requires `--mode style-lock-reset`; the default triassic reset target set is `#003-#005`, so an unqualified triassic reset cannot include reference species `#002`.
- Renamed rollout artifact helpers to the reset-specific prompt/log filenames while keeping helper date output injectable for tests instead of hardcoding the wall-clock date.
- Replaced static-anchor copying in `scripts/tamagotchi-animated-rollout.ts` with fresh Gemini anchor generation using the #001 and #002 stage sprites as references.
- Fresh Gemini anchors are now white-stripped and stage-normalized onto the target 256x256 stage canvas before they become references for exploratory or final generation.
- Split prompt construction into style-lock, species, and stage-or-stage+mood blocks to keep anchor prompts and final strip prompts aligned.
- Prototype metadata now uses a clearer composed contract: shared approval fields plus a nested `resetWorkflow` block describing mode, reference species, and anchor normalization.
- Batch artifact text now describes the reset workflow rather than the older copy-anchor rollout.

## Verification plan

- Run the focused Bun rollout helper test file, including control-flow and image-normalization branches.
- Run the related style-lock test file to confirm the shared approval metadata contract remains aligned with manifest gating.

## Notes

- No assets were regenerated in this task.
- No runtime files were changed in this task.
