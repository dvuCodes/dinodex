# 2026-03-29 Eoraptor animated sprite prototype

## Scope

Implemented the Eoraptor-only asset/prompt/log/output side of the approved animated sprite prototype without touching runtime files.

Owned paths used:

- `scripts/`
- `public/tamagotchi/001/`
- `.prompts/`
- `.logs/`

## Goal

Produce prototype mood-sheet assets for Eoraptor (`001`) across:

- `hatchling`
- `juvenile`
- `adult`

and moods:

- `idle`
- `happy`
- `sleepy`
- `sick`

while preserving reproducibility for later regeneration.

## Direct Gemini path

The original `infsh` route was blocked by guest-account billing limits, so the `nano-banana-2` skill was updated to call the Gemini API directly through `GEMINI_API_KEY`.

Working helper:

- [C:\Users\datvu\.agents\skills\nano-banana-2\gemini_image.py](C:\Users\datvu\.agents\skills\nano-banana-2\gemini_image.py)

Smoke verification succeeded with:

```text
python C:/Users/datvu/.agents/skills/nano-banana-2/gemini_image.py --prompt "pixel art banana, transparent background" --aspect-ratio 1:1 --image-size 1K --output-dir .tmp-gemini-smoke --prefix smoke
```

Result: Gemini returned a real generated image immediately through the direct API path.

## Updated generation strategy

Direct Gemini generation did not reliably return true alpha. The reliable path was:

1. Generate anchors, exploratory strips, and final strips on a `PURE SOLID WHITE background`.
2. Forbid checkerboards, borders, frames, and drop shadows in the prompt.
3. Strip the edge-connected near-white background deterministically into transparent PNGs with [scripts/remove-near-white-background.ts](/C:/Users/datvu/.codex/worktrees/4388/dinodex/scripts/remove-near-white-background.ts).

This preserved direct model generation for the sprite art while keeping transparent shipping assets deterministic.

## Fallback approach

The earlier deterministic-only fallback remains available in [scripts/eoraptor-prototype.ts](/C:/Users/datvu/.codex/worktrees/4388/dinodex/scripts/eoraptor-prototype.ts), but it is no longer the primary path for this prototype pass.

Pipeline:

1. Read the existing single-frame stage sprite.
2. Extract the largest connected alpha component to discard detached props/noise.
3. Normalize the subject into a fixed per-stage box.
4. Generate exploratory pose sheets with stronger offsets/rotation.
5. Generate final four-frame strips with milder in-place motion.
6. Write metadata describing normalization and fallback provenance.

## Normalization choices

Per-stage subject boxes and baselines:

- `hatchling`: target box `168`, center `x=120`, baseline `y=212`
- `juvenile`: target box `196`, center `x=129`, baseline `y=216`
- `adult`: target box `208`, center `x=128`, baseline `y=220`

Motion rules:

- `idle`: small drift, slight lift, balanced shadow change
- `happy`: stronger lift, brighter/saturated palette, snappier rotation
- `sleepy`: lower posture, darker/desaturated palette, slower heavier return
- `sick`: darkest palette, weakest lift, most slouched timing

Note on facial overlays:

- A first pass attempted synthetic eyelid overlays.
- Visual spot-checks showed the overlay did not stay reliable across all three body proportions.
- Final shipped fallback strips removed that overlay and relied on posture, lift, shadow, and palette instead.

## Outputs

Final strips written to [public/tamagotchi/001](/C:/Users/datvu/.codex/worktrees/4388/dinodex/public/tamagotchi/001):

- `hatchling-idle.png`
- `hatchling-happy.png`
- `hatchling-sleepy.png`
- `hatchling-sick.png`
- `juvenile-idle.png`
- `juvenile-happy.png`
- `juvenile-sleepy.png`
- `juvenile-sick.png`
- `adult-idle.png`
- `adult-happy.png`
- `adult-sleepy.png`
- `adult-sick.png`

Anchor stills:

- `prototype/anchors/hatchling-anchor.png`
- `prototype/anchors/juvenile-anchor.png`
- `prototype/anchors/adult-anchor.png`

Exploratory sheets:

- `prototype/exploratory/hatchling-idle-exploratory.png`
- `prototype/exploratory/hatchling-happy-exploratory.png`
- `prototype/exploratory/hatchling-sleepy-exploratory.png`
- `prototype/exploratory/hatchling-sick-exploratory.png`
- `prototype/exploratory/juvenile-idle-exploratory.png`
- `prototype/exploratory/juvenile-happy-exploratory.png`
- `prototype/exploratory/juvenile-sleepy-exploratory.png`
- `prototype/exploratory/juvenile-sick-exploratory.png`
- `prototype/exploratory/adult-idle-exploratory.png`
- `prototype/exploratory/adult-happy-exploratory.png`
- `prototype/exploratory/adult-sleepy-exploratory.png`
- `prototype/exploratory/adult-sick-exploratory.png`

Metadata:

- `prototype/metadata.json`

## Verification

Commands run:

```text
bun test scripts/eoraptor-prototype.test.ts
bun run scripts/eoraptor-prototype.ts
```

Result:

- helper tests passed: `5 pass / 0 fail`
- generated strips validated as `1024x256`
- generated anchor still validated as `256x256`
- spot-checked representative outputs visually after regeneration

Representative dimensional verification:

- `public/tamagotchi/001/hatchling-idle.png` -> `1024x256`
- `public/tamagotchi/001/juvenile-happy.png` -> `1024x256`
- `public/tamagotchi/001/adult-sick.png` -> `1024x256`
- `public/tamagotchi/001/prototype/anchors/adult-anchor.png` -> `256x256`
