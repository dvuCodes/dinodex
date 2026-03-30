# Jurassic Style-Lock Reset Prompts

Related plan: `Remaining Tamagotchi Animated Sprite Rollout`

## Workflow

Intended command contract: `bun run scripts/tamagotchi-animated-rollout.ts --mode style-lock-reset --era jurassic`

Default reset targets for `--era jurassic`: `#006`, `#007`, `#008`, `#009`, `#010`, `#011`, `#012`, `#013`, `#014`, `#015`, `#016`, `#017`

1. Use the approved #001 and #002 stage sprites as the style-lock references.
2. Generate fresh stage anchors through Nano Banana 2 / Gemini for the reset species only.
3. Strip white, then normalize each fresh anchor onto its target stage canvas before it becomes a reference.
4. Generate deterministic exploratory strips locally for each mood from those normalized anchors.
5. Generate final 4-frame prototype strips through Nano Banana 2 / Gemini.
6. Remove the pure white background deterministically and repair detached frame islands before review.

## #006 Allosaurus

Reset workflow:
- Use the approved #001 and #002 stage sprites as the only style-lock references.
- Generate a fresh Gemini anchor still for each target stage before any exploratory strip work.
- Strip white and normalize the fresh anchor onto the target stage canvas.
- Generate deterministic exploratory strips locally from the normalized anchor.
- Generate final prototype strips with Gemini using the normalized anchor plus exploratory strip as references.

Anchor prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #006 Allosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Generate a single approved-style Tamagotchi anchor still for later animation work.
Requirements: side view only, feet planted, centered readable silhouette, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
```

Final prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #006 Allosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Mood target: happy.
Using the approved stage anchor and the deterministic exploratory strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip.
Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
The loop should read clearly at tiny handheld-screen size and preserve the species silhouette identity.
Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

## #007 Stegosaurus

Reset workflow:
- Use the approved #001 and #002 stage sprites as the only style-lock references.
- Generate a fresh Gemini anchor still for each target stage before any exploratory strip work.
- Strip white and normalize the fresh anchor onto the target stage canvas.
- Generate deterministic exploratory strips locally from the normalized anchor.
- Generate final prototype strips with Gemini using the normalized anchor plus exploratory strip as references.

Anchor prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #007 Stegosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Generate a single approved-style Tamagotchi anchor still for later animation work.
Requirements: side view only, feet planted, centered readable silhouette, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
```

Final prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #007 Stegosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Mood target: happy.
Using the approved stage anchor and the deterministic exploratory strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip.
Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
The loop should read clearly at tiny handheld-screen size and preserve the species silhouette identity.
Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

## #008 Brachiosaurus

Reset workflow:
- Use the approved #001 and #002 stage sprites as the only style-lock references.
- Generate a fresh Gemini anchor still for each target stage before any exploratory strip work.
- Strip white and normalize the fresh anchor onto the target stage canvas.
- Generate deterministic exploratory strips locally from the normalized anchor.
- Generate final prototype strips with Gemini using the normalized anchor plus exploratory strip as references.

Anchor prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #008 Brachiosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Generate a single approved-style Tamagotchi anchor still for later animation work.
Requirements: side view only, feet planted, centered readable silhouette, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
```

Final prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #008 Brachiosaurus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Mood target: happy.
Using the approved stage anchor and the deterministic exploratory strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip.
Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
The loop should read clearly at tiny handheld-screen size and preserve the species silhouette identity.
Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

## #009 Diplodocus

Reset workflow:
- Use the approved #001 and #002 stage sprites as the only style-lock references.
- Generate a fresh Gemini anchor still for each target stage before any exploratory strip work.
- Strip white and normalize the fresh anchor onto the target stage canvas.
- Generate deterministic exploratory strips locally from the normalized anchor.
- Generate final prototype strips with Gemini using the normalized anchor plus exploratory strip as references.

Anchor prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #009 Diplodocus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Generate a single approved-style Tamagotchi anchor still for later animation work.
Requirements: side view only, feet planted, centered readable silhouette, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
```

Final prompt template:
```text
Style-lock family: #001 + #002 (001-002).
Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.
Output as clean pixel art on a PURE SOLID WHITE background only.

Species target: #009 Diplodocus.
Era: jurassic.
Keep the species-specific anatomy and proportions distinct within the shared family style.

Stage target: adult.
Mood target: happy.
Using the approved stage anchor and the deterministic exploratory strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip.
Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.
The loop should read clearly at tiny handheld-screen size and preserve the species silhouette identity.
Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

