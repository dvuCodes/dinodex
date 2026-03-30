# 2026-03-30 RIO-42 Jurassic animated wave 1 integration

Related issues: `RIO-42`, `RIO-43`, `RIO-44`, `RIO-45`, `RIO-46`

## Scope

Promoted Jurassic wave 1 species `#006`, `#007`, `#008`, and `#009` from generated prototype state into shipped animated Tamagotchi species.

## Decisions

- Kept the existing manifest-backed runtime contract and approved the four new species through prototype metadata instead of adding new runtime branches.
- Reused the style-lock reset flow from the `#003-#005` reset, with `#001-#002` as the permanent reference family.
- Allowed species-lane generation to skip shared artifacts, then ran a single integration-only pass to rebuild the manifest, prompt bundle, and batch log.
- Accepted the generated `#006-#009` strips after visual inspection, detached-island cleanup validation, and in-app playback checks.

## Repo evidence

- Shared batch prompt contract: `.prompts/2026-03-30-jurassic-style-lock-reset-prompts.md`
- Batch generation log: `.logs/2026-03-30-jurassic-style-lock-reset.md`
- Approved prototype metadata:
  - `.artifacts/tamagotchi/006/prototype/metadata.json`
  - `.artifacts/tamagotchi/007/prototype/metadata.json`
  - `.artifacts/tamagotchi/008/prototype/metadata.json`
  - `.artifacts/tamagotchi/009/prototype/metadata.json`
- Shipped strips:
  - `public/tamagotchi/006/*-(idle|happy|sleepy|sick).png`
  - `public/tamagotchi/007/*-(idle|happy|sleepy|sick).png`
  - `public/tamagotchi/008/*-(idle|happy|sleepy|sick).png`
  - `public/tamagotchi/009/*-(idle|happy|sleepy|sick).png`
- Manifest promotion: `public/tamagotchi/manifest.json`
- Rollout/test support:
  - `scripts/tamagotchi-animated-rollout.ts`
  - `scripts/tamagotchi-animated-rollout.test.ts`
  - `src/lib/tamagotchi-sprites.test.ts`

## Commands

```bash
bun run scripts/tamagotchi-animated-rollout.ts --mode style-lock-reset --era jurassic --species 6,7,8,9 --shared-artifacts-only --related-issue RIO-42
bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts
bun run lint
node output/playwright/jurassic-wave1-verify.cjs
```

## Verification

- `bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts`
- `bun run lint`
- `node output/playwright/jurassic-wave1-verify.cjs`

Playwright verification confirmed:

- species `#006` resolves `/tamagotchi/006/adult-happy.png`
- species `#008` resolves `/tamagotchi/008/adult-sick.png`
- frame playback advances by discrete transform jumps only, with no sideways strip travel animation

Captured evidence:

- `output/playwright/jurassic-006-happy.png`
- `output/playwright/jurassic-008-sick.png`
