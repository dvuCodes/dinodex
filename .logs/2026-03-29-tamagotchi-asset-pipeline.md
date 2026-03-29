# 2026-03-29 Tamagotchi Asset Pipeline

## Scope
- Added a dedicated tamagotchi sprite pipeline under `scripts/` without touching `src/components` or `src/lib`.
- Target output is a new `public/tamagotchi` tree with per-species stage sprites and a JSON manifest.
- Saved Nano Banana 2 prompt artifacts under `.prompts/` for future sprite regeneration.

## Decisions
- Kept the dinosaur asset pipeline intact and parallelized the tamagotchi path instead of refactoring shared code.
- Used deterministic egg sprite synthesis plus existing dinosaur stage art as the source for hatchling/juvenile/adult tamagotchi sprites.
- Chose PNG output for the tamagotchi sprites to keep the assets lossless and stable for a pixel-style renderer.

## Verification Plan
- Run the new generator for all species.
- Inspect the manifest and a sample of generated sprites.
- Run the new script tests plus the existing art-pipeline tests.

## Verification Result
- Generated 121 files under `public/tamagotchi` (120 sprites plus the manifest).
- Spot-checked the egg sprite for `#001` and the adult sprite for `#018` to confirm transparent, crisp output.
- `bun test scripts/art-pipeline.test.ts scripts/tamagotchi-art-pipeline.test.ts` passed.
