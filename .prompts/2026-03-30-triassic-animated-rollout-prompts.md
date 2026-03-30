# Triassic Animated Rollout Prompts

Related plan: `Remaining Tamagotchi Animated Sprite Rollout`

## Workflow

1. Treat the current shipped stage sprite as the approved anchor frame.
2. Generate deterministic exploratory strips locally for each mood.
3. Regenerate the final 4-frame strips through Nano Banana 2 / Gemini.
4. Remove the pure white background deterministically and repair detached frame islands before shipping.

## #003 Plateosaurus

Approved anchor policy:
- Reuse the currently shipped static Tamagotchi stage sprite as the approved anchor still for this rollout.
- Generate deterministic exploratory strips locally from that anchor for mood ideation.
- Generate final shipping strips with Gemini using the anchor plus exploratory strip as references.

Final prompt template:
```text
Using the approved Plateosaurus adult Tamagotchi anchor and the exploratory happy strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip on a PURE SOLID WHITE background. Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow. The happy loop should read clearly at tiny handheld-screen size and preserve Plateosaurus silhouette identity. Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

## #004 Herrerasaurus

Approved anchor policy:
- Reuse the currently shipped static Tamagotchi stage sprite as the approved anchor still for this rollout.
- Generate deterministic exploratory strips locally from that anchor for mood ideation.
- Generate final shipping strips with Gemini using the anchor plus exploratory strip as references.

Final prompt template:
```text
Using the approved Herrerasaurus adult Tamagotchi anchor and the exploratory happy strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip on a PURE SOLID WHITE background. Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow. The happy loop should read clearly at tiny handheld-screen size and preserve Herrerasaurus silhouette identity. Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

## #005 Postosuchus

Approved anchor policy:
- Reuse the currently shipped static Tamagotchi stage sprite as the approved anchor still for this rollout.
- Generate deterministic exploratory strips locally from that anchor for mood ideation.
- Generate final shipping strips with Gemini using the anchor plus exploratory strip as references.

Final prompt template:
```text
Using the approved Postosuchus adult Tamagotchi anchor and the exploratory happy strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip on a PURE SOLID WHITE background. Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow. The happy loop should read clearly at tiny handheld-screen size and preserve Postosuchus silhouette identity. Happy motion: brighter posture, stronger head or tail accent, energetic but still planted.
```

