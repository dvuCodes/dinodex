# Tamagotchi Animated Sprite Style-Lock Reset

Date: 2026-03-30
Status: Approved for planning

## Context

The animated Tamagotchi rollout established species `001` and `002` as the strongest examples of the intended sprite family. The later Triassic reset batch for `003-005` shipped valid animated strips, but the user identified a family mismatch: silhouette language, pixel-cluster treatment, palette/shading, and motion restraint do not read as belonging to the same world as `001-002`.

This design resets the rollout standard. Species `001-002` become the canonical visual family for all future animated Tamagotchi work, and `003-005` must be regenerated from scratch before the wider rollout continues.

## Goal

Create a permanent style-lock workflow for animated Tamagotchi sprites so that:

- `003-005` are fully regenerated to match the `001-002` family.
- All future species inherit the same visual contract.
- Species are only marked shippable when both the art and runtime presentation meet the style and playback requirements.

## In Scope

- Full art reset for species `003`, `004`, and `005`
- A reusable style contract derived from species `001-002`
- Prompt structure changes so the style contract is explicit and reusable
- Fresh anchor generation for `hatchling`, `juvenile`, and `adult` per species
- Fresh final mood strips for `idle`, `happy`, `sleepy`, and `sick`
- Existing deterministic cleanup, normalization, and playback validation
- Promotion of the style-lock workflow as the default process for future species

## Out of Scope

- Regenerating species `001-002`
- Continuing Jurassic or Cretaceous rollout before `003-005` are corrected
- Adding new moods or changing the 4-frame default
- Reworking Tamagotchi gameplay logic outside the sprite/runtime selection path

## Canonical Style Contract

Species `001-002` define the family standard. Future animated species must conform to the following:

### 1. Silhouette and Proportions

- Compact, readable silhouettes at Tamagotchi display size
- Body mass, limb thickness, and head-to-body proportions should feel consistent with the same sprite family, even when anatomy differs by species
- Frames must avoid silhouette wobble that changes the apparent creature design between poses

### 2. Pixel-Cluster and Line Discipline

- Similar cluster density and line confidence to `001-002`
- No muddy outlines, over-dithered interiors, or soft painterly transitions
- Shapes should read from deliberate pixel groupings rather than noisy texture

### 3. Palette and Shading Treatment

- Similar contrast range and shading depth to `001-002`
- Lighting should stay readable and restrained, with no jump toward flatter fills or overly high-detail rendering
- Palette choices may vary by species, but shading behavior must remain in-family

### 4. Motion Language

- Animation remains mostly in place
- `idle`: breathing, blink, small tail/head drift
- `happy`: brighter posture, stronger but still restrained head/tail accents
- `sleepy`: droop, heavier eyelids, slower recovery
- `sick`: slouch, reduced lift, weaker timing
- No arcade-like travel, silhouette popping, or exaggerated body shifts

## Reset Pipeline

`003-005` will be regenerated with a full reset, not patched from the current outputs.

### Stage 1: Fresh Anchors

For each species `003`, `004`, and `005`:

- Generate new `hatchling`, `juvenile`, and `adult` anchor frames
- Drive prompts from a reusable style block plus species-specific anatomy content
- Judge anchors against the `001-002` family contract before proceeding

No existing `003-005` anchors or final strips are treated as salvage inputs.

### Stage 2: Exploratory Mood Strips

For each approved anchor:

- Generate exploratory 4-frame strips for `idle`, `happy`, `sleepy`, and `sick`
- Use these as selection artifacts only, not shipping outputs
- Reject explorations that drift from the family style, create silhouette wobble, or introduce excessive motion

### Stage 3: Final Strip Regeneration

For each approved exploration:

- Regenerate the shipping 4-frame strip
- Keep the same stage/mood coverage as the Eoraptor workflow: `3 stages x 4 moods = 12 strips` per species

### Stage 4: Deterministic Cleanup and Normalization

All final strips continue through the existing cleanup path:

- solid-white generation background
- deterministic near-white background removal
- per-frame connected-component cleanup to remove detached islands
- fixed frame-box normalization so feet anchoring, body mass, and head height remain stable

## Prompt Architecture

The prompt system must be separated into two explicit layers:

### Reusable style block

A locked block derived from `001-002` that defines:

- silhouette discipline
- pixel-cluster treatment
- shading behavior
- motion restraint
- fixed output expectations for white background and strip structure

### Species block

A species-specific block that defines:

- anatomy
- posture character
- age-stage differences
- color direction within the family shading rules

This split is required so future species inherit the same visual contract rather than drifting as prompt wording evolves batch to batch.

## Runtime and Shipping Rules

- A species is not added to the animated manifest as approved until its regenerated strips pass the style-lock gate
- Runtime resolution stays manifest-driven; unapproved species remain on the single-frame fallback path
- Existing frame-swap playback behavior remains the required runtime presentation for animated species

## Acceptance Criteria

### Visual acceptance

For each of `003-005`:

- `hatchling`, `juvenile`, and `adult` read as one coherent species family
- The species reads as belonging to the same animated family as `001-002`
- `idle`, `happy`, `sleepy`, and `sick` are distinct without breaking motion restraint
- No detached islands, frame-edge bleed, or playback overlap

### Runtime acceptance

- The correct `stage-mood` strips resolve in-app
- The sprite remains in-place during playback
- Reduced-motion behavior remains correct
- Playwright validation confirms the rendered output is visually coherent at Tamagotchi screen size

## Rollout Rule For Future Species

This style-lock becomes the default rule for all future animated species:

1. Use `001-002` as the canonical visual family.
2. Pass fresh anchors before any final strips are accepted.
3. Do not promote a species into the animated manifest until it passes both visual and runtime acceptance.
4. Do not continue to later era batches if the current batch fails the family consistency gate.

## Verification Expectations

Implementation planning must include:

- reproducible `.prompts` artifacts for the reset prompts
- `.logs` coverage for shortlist and normalization decisions
- automated checks for manifest/runtime resolution
- Playwright checks for in-app strip rendering
- explicit review of regenerated `003-005` against `001-002`

## Design Decision Summary

- Chosen path: full reset of `003-005`
- Canonical family reference: `001-002`
- Style lock applies to all future animated species
- The root problem is solved in prompt and approval discipline, not by post-processing alone
