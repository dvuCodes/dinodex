# 2026-03-30 jurassic Tamagotchi style-lock reset

Related issue: `RIO-42`

## Scope

This run generated the style-lock reset asset set for species #006, #007, #008, #009 under the approved #001-#002 family.

## Decisions

- The rollout CLI now requires `--mode style-lock-reset`; the default jurassic reset target set is `#006-#017`, so an unqualified jurassic reset cannot include reference species `#002`.
- Generated 12 fresh anchors, 48 exploratory strips, and 48 final strips for this subset run.
- Fresh Gemini anchors were white-stripped and stage-normalized onto the target 256x256 stage canvas before becoming references for exploratory or final generation.
- Final strips were background-stripped and repaired to remove detached frame islands before review.
- Prototype metadata remains approval-gated: generated assets are present, but manifest promotion still depends on explicit approval.

## Verification plan

- Run the focused Bun rollout helper and style-lock tests after shared-artifact integration.
- Validate approved species in-app with the debug dino switcher before manifest promotion.

## Notes

- Species included in this run: #006, #007, #008, #009.
- Shared manifest and batch artifact promotion happen in the integration step, not inside subset lane runs.
