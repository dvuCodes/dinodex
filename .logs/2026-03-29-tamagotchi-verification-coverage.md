# 2026-03-29 Tamagotchi Verification Coverage

## Scope
- Verification-only update.
- No production source edited.
- Coverage added under `src/lib/*.test.ts` and `e2e/`.

## Notes
- Egg persistence is covered by simulating a run before hatch time and asserting the seed timestamps remain intact.
- Animation-state mapping is covered at the lib layer by asserting the mood buckets used by the avatar animation.
- Sprite fallback is covered in lib tests through placeholder-art path helpers and in Playwright via a smoke test that keeps art requests blocked while confirming the pixel shell still renders.
- The active-run Playwright test needed a forced click because the Next dev overlay can intercept pointer events in this environment.

## Verification
- `bun test src/lib/tamagotchi.test.ts src/lib/review-fixes.test.ts`
- `bun run lint`
- `bunx playwright test e2e/tamagotchi-overhaul.spec.ts`
