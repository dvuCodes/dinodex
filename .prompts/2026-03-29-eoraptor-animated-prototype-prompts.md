# Eoraptor Animated Prototype Prompts

Related plan: `Eoraptor Animated Sprite Prototype`

## Direct Gemini execution

Current working invocation uses the updated [$nano-banana-2](C:\Users\datvu\.agents\skills\nano-banana-2\SKILL.md) helper:

```text
python C:/Users/datvu/.agents/skills/nano-banana-2/gemini_image.py ...
```

with `GEMINI_API_KEY` from the local environment.

For this prototype, direct Gemini generation proved more reliable with:

- `PURE SOLID WHITE background`
- `no border`
- `no frame`
- `no drop shadow`

followed by deterministic edge-connected near-white background stripping into transparent PNGs.

## Intended Nano Banana 2 prompt set

These are the prompts to reuse once a funded/authorized `infsh` account is available.

### Anchor frame prompt

```text
Use the input Eoraptor art only as species identity reference. Create a STRICT pixel-art tamagotchi sprite of Eoraptor for the {stage} stage centered in a square frame on a PURE SOLID WHITE background. Requirements: chunky visible pixels, no anti-aliasing, no painterly shading, no smooth gradients, no realistic texture, no illustration look, no checkerboard, no border, no frame, no drop shadow. Side view. Compact virtual-pet silhouette. Warm sandy-brown limited palette. Readable at tiny handheld-screen size. One single sprite only.
```

### Exploratory mood-pose prompt

```text
Using the input pixel-art Eoraptor {stage} anchor as style and silhouette reference, generate a STRICT 4-frame horizontal exploratory pixel sprite strip for the {mood} mood on a PURE SOLID WHITE background. Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no checkerboard, no text, no scenery, no props, no border, no frame, no drop shadow. This is exploratory, so push the pose a little further than final motion while keeping the dinosaur planted.
```

### Final strip regeneration prompt

```text
Using the chosen Eoraptor {stage} {mood} anchor and exploratory strip as reference, generate a STRICT clean 4-frame horizontal pixel sprite strip on a PURE SOLID WHITE background. Keep feet anchoring consistent, preserve the approved silhouette, and make the loop read clearly on a tiny tamagotchi screen. Avoid camera motion, scenery, labels, props, borders, frames, drop shadows, or exaggerated bouncing. The result should feel alive but mostly in place.
```

## Postprocess

After direct Gemini generation, remove the solid-white background deterministically with [scripts/remove-near-white-background.ts](/C:/Users/datvu/.codex/worktrees/4388/dinodex/scripts/remove-near-white-background.ts) before shipping the PNG into the Tamagotchi asset tree.
