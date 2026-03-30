# 2026-03-30 Daily Bug Scan: Tamagotchi Hydration Mismatch

## Linear
- Issue: `RIO-39` Fix tamagotchi hydration mismatch

## Evidence
- Recent verification logs repeatedly noted an existing hydration mismatch on `/tamagotchi`:
  - `.logs/2026-03-30-tamagotchi-frame-swap-fix.md`
  - `.logs/2026-03-30-tamagotchi-skip-incubation.md`
  - `.logs/2026-03-30-tamagotchi-sprite-playback-fix.md`
  - `.logs/2026-03-30-eoraptor-strip-cleanup.md`
- Recent code in `src/components/tamagotchi/TamagotchiGame.tsx` loaded persisted tamagotchi state during render through the initial state path, which let SSR render the empty adoption shell while the first client render could immediately render a saved run from `localStorage`.
- Added `src/components/tamagotchi/TamagotchiGame.hydration.test.tsx` to compare server markup with the first client render when storage is pre-seeded.
- The new test failed before the patch because the first client render contained the active Eoraptor run instead of the empty adoption shell.

## Fix
- Kept the initial render storage-free by defaulting the component to `null` run state plus empty meta.
- Deferred persisted tamagotchi/meta hydration into a post-mount timer callback so the first client render matches SSR markup.
- Left the existing reconciliation/meta-persistence flow intact once hydration completes.

## Verification
- `bun test src/components/tamagotchi/TamagotchiGame.hydration.test.tsx src/lib/tamagotchi.test.ts`
- `C:\\Users\\CodexSandboxOffline\\.codex\\.sandbox\\cwd\\7c13d4cf2119fbe3\\node_modules\\.bin\\eslint.exe src/`
- `bun run build`

## Skipped
- The recent sleep-debt reconciliation change in `src/lib/tamagotchi.ts` looks harsher than the prior implementation, but the repo does not currently provide strong enough acceptance evidence to call it a bug. No fix proposed.
