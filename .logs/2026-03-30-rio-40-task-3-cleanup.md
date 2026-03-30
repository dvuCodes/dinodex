# 2026-03-30 RIO-40 Task 3 cleanup

Related issue: `RIO-40`

## Context

Task 3 cleanup pass to separate deployable Tamagotchi sprites from non-shipping prototype outputs for species `#003-#005`.

## Decisions

- Moved `prototype` artifacts for `#003-#005` out of `public/tamagotchi/*` into `.artifacts/tamagotchi/*/prototype`.
- Updated rollout helpers to treat `.artifacts/...` as the canonical private prototype root while leaving final mood strips in `public/`.
- Removed manifest `metadataPath` output so the public manifest no longer leaks local filesystem paths.
- Rewrote moved metadata to repo-relative paths and dropped the workstation-specific Gemini helper path.

## Verification

- `bun test scripts/tamagotchi-animated-rollout.test.ts`
- `bun test scripts/tamagotchi-style-lock.test.ts`
- Rebuilt `public/tamagotchi/manifest.json` after the artifact move.
