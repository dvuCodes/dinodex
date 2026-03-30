# Tamagotchi Style-Lock Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reset animated Tamagotchi species `003-005` so they match the canonical `001-002` sprite family, and make that style-lock the default rule for all future animated species.

**Architecture:** Move the rollout from an implicit "all strips present means shipped" rule to an explicit style-lock workflow. Split the generation pipeline into reusable style-contract helpers plus species-specific prompt content, gate manifest animation support on approval metadata instead of file presence alone, then regenerate `003-005` from fresh anchors through the existing cleanup and playback pipeline.

**Tech Stack:** Bun, TypeScript, Next.js, Sharp, Gemini Nano Banana 2 helper, Playwright, JSON manifest metadata

---

## File Structure

### Existing files to modify

- `scripts/tamagotchi-animated-rollout.ts`
  - Current era rollout script. It currently copies static stage art as anchors, writes deterministic exploratory strips, generates final strips through Gemini, then rebuilds the manifest.
- `scripts/tamagotchi-manifest.ts`
  - Builds `public/tamagotchi/manifest.json`. It currently marks a species as animated whenever all mood strips exist.
- `scripts/tamagotchi-animated-rollout.test.ts`
  - Helper-path tests for rollout artifact locations and batch definitions.
- `src/lib/tamagotchi-sprites.ts`
  - Runtime sprite descriptor resolver backed by `public/tamagotchi/manifest.json`.
- `src/lib/tamagotchi-sprites.test.ts`
  - Runtime descriptor tests for animated and non-animated species.
- `AGENTS.md`
  - Repo workflow instructions. Needs the corrected style-lock rule captured after implementation.

### New files to create

- `scripts/tamagotchi-style-lock.ts`
  - Central reusable style-contract definitions, prompt block builders, and approval metadata helpers.
- `scripts/tamagotchi-style-lock.test.ts`
  - Unit tests for style-block content, approval gating helpers, and artifact path helpers.
- `.prompts/2026-03-30-triassic-style-lock-reset-prompts.md`
  - Prompt artifact for the `003-005` reset using the reusable style block plus species block.
- `.logs/2026-03-30-triassic-style-lock-reset.md`
  - Reset log recording shortlist rationale, normalization decisions, and verification evidence.

### Existing generated assets to replace

- `public/tamagotchi/003/*.png`
- `public/tamagotchi/004/*.png`
- `public/tamagotchi/005/*.png`
- `public/tamagotchi/003/prototype/**`
- `public/tamagotchi/004/prototype/**`
- `public/tamagotchi/005/prototype/**`

### Existing generated data to rewrite

- `public/tamagotchi/manifest.json`

## Task 1: Add reusable style-lock helpers and approval metadata

**Files:**
- Create: `scripts/tamagotchi-style-lock.ts`
- Test: `scripts/tamagotchi-style-lock.test.ts`
- Modify: `scripts/tamagotchi-manifest.ts`

- [ ] **Step 1: Write failing tests for style-lock helper outputs**

```ts
import { describe, expect, test } from "bun:test";
import {
  STYLE_LOCK_REFERENCE_SPECIES,
  buildSpeciesPromptBlock,
  buildStyleLockPromptBlock,
  isAnimatedSpeciesApproved,
} from "./tamagotchi-style-lock";

describe("tamagotchi style-lock helpers", () => {
  test("locks the canonical family reference to 001 and 002", () => {
    expect(STYLE_LOCK_REFERENCE_SPECIES).toEqual([1, 2]);
  });

  test("builds a reusable style block with the required family constraints", () => {
    const prompt = buildStyleLockPromptBlock();

    expect(prompt).toContain("001");
    expect(prompt).toContain("002");
    expect(prompt).toContain("silhouette");
    expect(prompt).toContain("pixel-cluster");
    expect(prompt).toContain("PURE SOLID WHITE background");
  });

  test("requires explicit approval metadata before treating a species as animated", () => {
    expect(
      isAnimatedSpeciesApproved({
        approved: true,
        frameCount: 4,
        moods: ["idle", "happy", "sleepy", "sick"],
        stages: ["hatchling", "juvenile", "adult"],
        styleFamily: "001-002",
      })
    ).toBe(true);

    expect(
      isAnimatedSpeciesApproved({
        approved: false,
        frameCount: 4,
        moods: ["idle", "happy", "sleepy", "sick"],
        stages: ["hatchling", "juvenile", "adult"],
        styleFamily: "001-002",
      })
    ).toBe(false);
  });

  test("builds a species prompt block without repeating the shared style block", () => {
    const prompt = buildSpeciesPromptBlock({
      id: 3,
      name: "Plateosaurus",
      era: "triassic",
    });

    expect(prompt).toContain("Plateosaurus");
    expect(prompt).toContain("triassic");
    expect(prompt).not.toContain("001-002 sprite family");
  });
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run: `bun test scripts/tamagotchi-style-lock.test.ts`

Expected: FAIL with module-not-found or missing export errors for `scripts/tamagotchi-style-lock.ts`.

- [ ] **Step 3: Implement the reusable style-lock helper module**

```ts
// scripts/tamagotchi-style-lock.ts
import type { Stage } from "../src/lib/types";
import type { TamagotchiAnimationState } from "../src/lib/tamagotchi";

export const STYLE_LOCK_REFERENCE_SPECIES = [1, 2] as const;
export const STYLE_LOCK_STYLE_FAMILY = "001-002" as const;
export const STYLE_LOCK_STAGES: Stage[] = ["hatchling", "juvenile", "adult"];
export const STYLE_LOCK_MOODS: TamagotchiAnimationState[] = ["idle", "happy", "sleepy", "sick"];

export type AnimatedApprovalMetadata = {
  approved: boolean;
  frameCount: number;
  moods: TamagotchiAnimationState[];
  stages: Stage[];
  styleFamily: string;
};

export function buildStyleLockPromptBlock(): string {
  return [
    "Match the approved Tamagotchi sprite family established by species 001 and 002.",
    "Keep silhouette compact and readable at device scale.",
    "Use deliberate pixel-cluster shapes and restrained in-place motion.",
    "Keep shading in-family and output on a PURE SOLID WHITE background.",
  ].join(" ");
}

export function buildSpeciesPromptBlock(species: { id: number; name: string; era: string }): string {
  return `Species #${String(species.id).padStart(3, "0")} ${species.name} from the ${species.era} era. Preserve anatomy and stage readability.`;
}

export function isAnimatedSpeciesApproved(metadata?: Partial<AnimatedApprovalMetadata> | null): metadata is AnimatedApprovalMetadata {
  return Boolean(
    metadata?.approved &&
      metadata?.styleFamily === STYLE_LOCK_STYLE_FAMILY &&
      metadata?.frameCount === 4 &&
      metadata?.stages?.length === 3 &&
      metadata?.moods?.length === 4
  );
}
```

- [ ] **Step 4: Update manifest gating to use approval metadata instead of file presence alone**

```ts
// scripts/tamagotchi-manifest.ts
import { isAnimatedSpeciesApproved, STYLE_LOCK_MOODS, STYLE_LOCK_STAGES } from "./tamagotchi-style-lock";

function readPrototypeApproval(projectRoot: string, dinoId: number): AnimatedApprovalMetadata | null {
  // read public/tamagotchi/<id>/prototype/metadata.json if present
}

const metadata = readPrototypeApproval(projectRoot, dinoId);
const animation = hasAnimatedMoodStrips(projectRoot, dinoId, exists) && isAnimatedSpeciesApproved(metadata)
  ? {
      approved: true,
      frameCount: metadata.frameCount,
      stages: [...STYLE_LOCK_STAGES],
      moods: [...STYLE_LOCK_MOODS],
      styleFamily: metadata.styleFamily,
    }
  : undefined;
```

- [ ] **Step 5: Run the helper and manifest-adjacent tests**

Run: `bun test scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add scripts/tamagotchi-style-lock.ts scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-manifest.ts scripts/tamagotchi-animated-rollout.test.ts
git commit -m "feat: add tamagotchi style-lock helpers"
```

## Task 2: Refactor rollout prompts and anchor generation for full-reset mode

**Files:**
- Modify: `scripts/tamagotchi-animated-rollout.ts`
- Modify: `scripts/tamagotchi-art-pipeline.ts`
- Modify: `.prompts/2026-03-30-triassic-style-lock-reset-prompts.md`
- Modify: `.logs/2026-03-30-triassic-style-lock-reset.md`

- [ ] **Step 1: Write failing tests for reset-mode prompt and artifact behavior**

```ts
import { describe, expect, test } from "bun:test";
import {
  getAnimatedBatchPromptPath,
  getAnimatedBatchLogPath,
  getAnimatedPrototypeAnchorOutputPath,
} from "./tamagotchi-animated-rollout";

describe("tamagotchi animated rollout reset mode", () => {
  test("writes reset artifact files with style-lock naming", () => {
    expect(getAnimatedBatchPromptPath("C:/repo", "triassic", "style-lock-reset")).toBe(
      "C:/repo/.prompts/2026-03-30-triassic-style-lock-reset-prompts.md"
    );
    expect(getAnimatedBatchLogPath("C:/repo", "triassic", "style-lock-reset")).toBe(
      "C:/repo/.logs/2026-03-30-triassic-style-lock-reset.md"
    );
  });

  test("keeps prototype anchors in the same species-scoped anchor directory", () => {
    expect(getAnimatedPrototypeAnchorOutputPath("C:/repo", 3, "adult")).toBe(
      "C:/repo/public/tamagotchi/003/prototype/anchors/adult-anchor.png"
    );
  });
});
```

- [ ] **Step 2: Run the rollout helper tests to verify they fail**

Run: `bun test scripts/tamagotchi-animated-rollout.test.ts`

Expected: FAIL because the helper signatures and reset naming do not exist yet.

- [ ] **Step 3: Replace static-anchor copying with fresh Gemini anchor generation**

```ts
// scripts/tamagotchi-animated-rollout.ts
async function generateApprovedAnchor(species: DinoEntry, stage: Stage): Promise<string> {
  const prompt = [buildStyleLockPromptBlock(), buildSpeciesPromptBlock(species), buildAnchorPrompt(stage)].join("\n\n");
  const outputDir = getRawAnchorGenerationDir(PROJECT_ROOT, species.id, stage);
  const rawImagePath = await runGeminiImage(prompt, outputDir, `${stage}-anchor`, []);

  const outputPath = getAnimatedPrototypeAnchorOutputPath(PROJECT_ROOT, species.id, stage);
  await stripNearWhiteBackground(rawImagePath, outputPath);
  await normalizeAnchor(outputPath, stage);
  return outputPath;
}

async function generateSpeciesBatch(speciesId: number, batch: BatchName): Promise<SpeciesMetadata> {
  // replace copyApprovedAnchor(...) with generateApprovedAnchor(...)
}
```

- [ ] **Step 4: Split final prompt construction into style block + species block + stage/mood block**

```ts
function buildFinalPrompt(species: DinoEntry, stage: Stage, animationState: TamagotchiAnimationState): string {
  return [
    buildStyleLockPromptBlock(),
    buildSpeciesPromptBlock(species),
    buildStageMoodPrompt(stage, animationState),
    "Use the approved anchor and exploratory strip as references.",
    "Generate a STRICT 4-frame horizontal sprite strip.",
  ].join("\n\n");
}
```

- [ ] **Step 5: Record approval metadata in prototype metadata**

```ts
const metadata: SpeciesMetadata = {
  speciesId,
  speciesName: species.name,
  approved: true,
  styleFamily: "001-002",
  anchors: [],
  exploratory: [],
  finalStrips: [],
  // keep generatedAt/model/helper fields
};
```

- [ ] **Step 6: Update batch artifacts to describe the reset instead of the old copy-anchor workflow**

```md
## Workflow decisions

- Generated fresh anchors through the direct Gemini helper rather than copying static stage sprites.
- Applied the reusable 001-002 style-lock prompt block to all anchor and final-strip generations.
- Regenerated species 003-005 from scratch before re-approving them for the animated manifest.
```

- [ ] **Step 7: Run rollout helper tests**

Run: `bun test scripts/tamagotchi-animated-rollout.test.ts scripts/tamagotchi-style-lock.test.ts`

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add scripts/tamagotchi-animated-rollout.ts scripts/tamagotchi-art-pipeline.ts .prompts/2026-03-30-triassic-style-lock-reset-prompts.md .logs/2026-03-30-triassic-style-lock-reset.md
git commit -m "feat: reset tamagotchi rollout prompts for style lock"
```

## Task 3: Regenerate species 003-005 under the style-lock workflow

**Files:**
- Modify: `public/tamagotchi/003/**/*`
- Modify: `public/tamagotchi/004/**/*`
- Modify: `public/tamagotchi/005/**/*`
- Modify: `public/tamagotchi/manifest.json`

- [ ] **Step 1: Remove the current 003-005 animated outputs so the reset is clean**

Run:

```powershell
Remove-Item -LiteralPath public/tamagotchi/003/prototype -Recurse -Force
Remove-Item -LiteralPath public/tamagotchi/004/prototype -Recurse -Force
Remove-Item -LiteralPath public/tamagotchi/005/prototype -Recurse -Force
Remove-Item -LiteralPath public/tamagotchi/003/*-happy.png,public/tamagotchi/003/*-idle.png,public/tamagotchi/003/*-sleepy.png,public/tamagotchi/003/*-sick.png -Force
Remove-Item -LiteralPath public/tamagotchi/004/*-happy.png,public/tamagotchi/004/*-idle.png,public/tamagotchi/004/*-sleepy.png,public/tamagotchi/004/*-sick.png -Force
Remove-Item -LiteralPath public/tamagotchi/005/*-happy.png,public/tamagotchi/005/*-idle.png,public/tamagotchi/005/*-sleepy.png,public/tamagotchi/005/*-sick.png -Force
```

Expected: the old animated strips for `003-005` are removed while base stage sprites remain.

- [ ] **Step 2: Run the reset rollout for the three target species**

Run: `bun run tsx scripts/tamagotchi-animated-rollout.ts --era triassic --species 3,4,5 --mode style-lock-reset`

Expected output:

```text
Generating animated Tamagotchi strips for #003 ...
Generating animated Tamagotchi strips for #004 ...
Generating animated Tamagotchi strips for #005 ...
```

- [ ] **Step 3: Verify each species produced anchors, exploratory strips, final strips, and metadata**

Run:

```powershell
Get-ChildItem public/tamagotchi/003/prototype/anchors
Get-ChildItem public/tamagotchi/003/prototype/exploratory
Get-ChildItem public/tamagotchi/003 | Where-Object Name -match 'adult-|juvenile-|hatchling-'
Get-Content public/tamagotchi/003/prototype/metadata.json
```

Expected:

- 3 anchors
- 12 exploratory strips
- 12 final strips
- metadata containing `"approved": true` and `"styleFamily": "001-002"`

Repeat for `004` and `005`.

- [ ] **Step 4: Rebuild and inspect the manifest**

Run: `bun run tsx -e "import { writeTamagotchiManifest } from './scripts/tamagotchi-manifest'; console.log(writeTamagotchiManifest(process.cwd()));"`

Expected: prints `.../public/tamagotchi/manifest.json`

- [ ] **Step 5: Commit regenerated assets and manifest**

```bash
git add public/tamagotchi/003 public/tamagotchi/004 public/tamagotchi/005 public/tamagotchi/manifest.json
git commit -m "feat: regenerate triassic animated sprites with style lock"
```

## Task 4: Tighten runtime and automated checks around approval-gated animation

**Files:**
- Modify: `src/lib/tamagotchi-sprites.ts`
- Modify: `src/lib/tamagotchi-sprites.test.ts`
- Modify: `src/components/tamagotchi/DinoAvatar.tsx`

- [ ] **Step 1: Write failing runtime tests for approval-aware manifest entries**

```ts
import { describe, expect, test } from "bun:test";
import { getTamagotchiSpriteSheet } from "./tamagotchi-sprites";

describe("tamagotchi animated manifest gating", () => {
  test("uses mood strips for an approved style-lock species", () => {
    const sprite = getTamagotchiSpriteSheet(3, "adult", "happy");

    expect(sprite.expectedSrc).toBe("/tamagotchi/003/adult-happy.png");
    expect(sprite.expectedFrameCount).toBe(4);
  });

  test("falls back to base stage art when animation approval is absent", () => {
    const sprite = getTamagotchiSpriteSheet(18, "adult", "happy");

    expect(sprite.expectedSrc).toBe("/tamagotchi/018/adult.png");
    expect(sprite.expectedFrameCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run the runtime tests to verify they fail if the manifest/schema is stale**

Run: `bun test src/lib/tamagotchi-sprites.test.ts`

Expected: FAIL until the resolver understands the updated manifest entry shape.

- [ ] **Step 3: Update runtime parsing to tolerate the richer animation metadata while preserving current behavior**

```ts
type ManifestAnimationEntry = {
  approved?: boolean;
  frameCount?: number;
  moods?: TamagotchiAnimationState[];
  stages?: Stage[];
  styleFamily?: string;
};

const usesMoodStrip =
  Boolean(animation?.approved) &&
  (animation?.stages ?? []).includes(stage) &&
  (animation?.moods ?? []).includes(animationState);
```

- [ ] **Step 4: Keep outer bob suppression based on resolved strip animation**

```tsx
const usesPrototypeStripMotion = stage !== "egg" && spriteDescriptor.expectedFrameCount > 1;
```

Expected: no logic change if the resolver already reports approved 4-frame strips correctly.

- [ ] **Step 5: Run runtime tests**

Run: `bun test src/lib/tamagotchi-sprites.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/tamagotchi-sprites.ts src/lib/tamagotchi-sprites.test.ts src/components/tamagotchi/DinoAvatar.tsx
git commit -m "test: gate animated sprite runtime on approved manifest data"
```

## Task 5: Verify species 003-005 in-app and capture rollout evidence

**Files:**
- Modify: `.logs/2026-03-30-triassic-style-lock-reset.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Run script and runtime unit tests together**

Run:

```bash
bun test scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts
bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-art-pipeline.test.ts
```

Expected: PASS

- [ ] **Step 2: Start or confirm the dev server for this checkout**

Run: `bun run dev`

Expected: a local Next.js server for `C:/Users/datvu/projects/dinodex`

- [ ] **Step 3: Validate each regenerated species with Playwright**

Run Playwright checks that:

- seed local storage to species `003`, stage `adult`, mood `happy`
- confirm heading and badge match the species
- confirm `backgroundImage` resolves to `/tamagotchi/003/adult-happy.png`
- confirm the strip renderer swaps in place without overlap

Repeat for `004` and `005`.

Representative evaluation snippet:

```js
const sprite = document.querySelector('[aria-label*="pixel sprite"]');
const style = window.getComputedStyle(sprite);
return {
  backgroundImage: style.backgroundImage,
  transform: style.transform,
};
```

- [ ] **Step 4: Update the reset log with acceptance results**

```md
## Verification

- `bun test scripts/tamagotchi-style-lock.test.ts scripts/tamagotchi-animated-rollout.test.ts`
- `bun test src/lib/tamagotchi-sprites.test.ts scripts/tamagotchi-art-pipeline.test.ts`
- Playwright validation for species `003`, `004`, and `005`
- Confirmed `003-005` now read in-family with `001-002` at Tamagotchi screen size
```

- [ ] **Step 5: Update AGENTS.md with the corrected process rule**

```md
- When expanding animated Tamagotchi species, treat `001-002` as the canonical family reference, generate fresh anchors before final strips, and do not mark a species animated in the manifest until prototype metadata records explicit approval.
```

- [ ] **Step 6: Commit**

```bash
git add .logs/2026-03-30-triassic-style-lock-reset.md AGENTS.md
git commit -m "docs: record tamagotchi style-lock verification"
```

## Parallel Execution Notes

- Safe parallel lane 1: Task 1 helper/module work
- Safe parallel lane 2: Task 4 runtime/test updates once Task 1 defines the manifest metadata shape
- Safe parallel lane 3: Task 5 Playwright verification after Task 3 regenerates assets

Do **not** parallelize species regeneration itself until Gemini quota and local file writes are confirmed safe for concurrent runs. The recommended execution shape is one worker for code changes, then one worker per verification slice after assets exist.

## Self-Review

### Spec coverage

- Full reset of `003-005`: covered by Task 2 and Task 3
- Reusable style contract from `001-002`: covered by Task 1 and Task 2
- Explicit prompt structure split: covered by Task 2
- Approval-gated manifest/runtime behavior: covered by Task 1 and Task 4
- Playwright visual validation and logs: covered by Task 5
- Future rollout rule capture: covered by Task 5

### Placeholder scan

- No `TODO` or `TBD` placeholders remain
- Each task includes concrete files, commands, and expected outcomes

### Type consistency

- `AnimatedApprovalMetadata` is introduced once and reused as the source of truth for manifest gating
- `frameCount`, `stages`, `moods`, and `styleFamily` are named consistently across helper, manifest, and runtime tasks

