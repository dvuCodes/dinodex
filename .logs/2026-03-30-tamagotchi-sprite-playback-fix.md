## Summary

Fixed the Tamagotchi sprite-strip playback so multi-frame strips advance in-place instead of stepping through percentage-based background positions that caused the sprite to appear to slide across the screen.

## Root Cause

- `@keyframes tamagotchi-sprite` in `src/app/globals.css` animated `background-position` from `0 0` to `100% 0`.
- For fixed-size sprite windows, percentage-based background positioning is the wrong coordinate system. In Playwright, the Eoraptor strip stepped through `0%`, `25%`, `50%`, and `75%` instead of fixed frame-width offsets.
- That made the animation read like the image was moving sideways rather than swapping the visible frame in place.

## Implementation

- Added `getSpriteSheetTravelPx(frameCount, frameSizePx)` in `src/lib/tamagotchi-sprites.ts`.
- Updated `DinoAvatar.tsx` and `EggCountdown.tsx` to pass a `--pixel-sprite-end-x` custom property per sprite instance.
- Changed `@keyframes tamagotchi-sprite` to animate toward that fixed negative pixel endpoint.

## Verification

- `bun test src/lib/tamagotchi-sprites.test.ts`
- Playwright on `http://localhost:3005/tamagotchi`
  - Seeded an adult happy Eoraptor run
  - Sampled `[data-testid="tamagotchi-pixel-sprite"]` over time before the fix and saw `backgroundPositionX` advance as `0%`, `25%`, `50%`, `75%`
  - Sampled again after the fix and saw `backgroundPositionX` advance as `0px`, `-160px`, `-320px`, `-480px`
  - Confirmed the runtime custom property was `--pixel-sprite-end-x: -640px`

## Notes

- `bun run lint` still reports the existing `react-hooks/refs` issues in `src/components/tamagotchi/TamagotchiGame.tsx`.
- `bunx tsc --noEmit` still reports the repo's existing missing `bun:test` type declarations across test files.
- Existing dev-console issues remain unchanged: hydration mismatch on `/tamagotchi` and missing `favicon.ico`.
