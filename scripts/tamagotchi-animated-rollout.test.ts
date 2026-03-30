import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import {
  TAMAGOTCHI_ANIMATED_BATCHES,
  buildAnimatedBatchLogArtifact,
  buildAnimatedBatchPromptArtifact,
  buildAnimatedPrototypeMetadata,
  buildAnimatedAnchorPrompt,
  buildAnimatedFinalPrompt,
  getAnchorTransientPath,
  ensureStyleLockReferencePathsExist,
  getAnimatedArtifactDate,
  getAnimatedBatchPromptPath,
  getAnimatedBatchLogPath,
  getAnimatedPrototypeAnchorOutputPath,
  getAnimatedPrototypeExploratoryOutputPath,
  getAnimatedPrototypeMetadataPath,
  getAnimatedPrototypeSpriteOutputPath,
  getStyleLockAnchorReferencePaths,
  prepareGeneratedAnchorForReuse,
  normalizeGeneratedAnchor,
  parseAnimatedRolloutArgs,
} from "./tamagotchi-animated-rollout";

const tempDirs: string[] = [];

afterAll(() => {
  for (const tempDir of tempDirs) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("tamagotchi animated rollout helpers", () => {
  test("declares the rollout batches by era", () => {
    expect(TAMAGOTCHI_ANIMATED_BATCHES.triassic).toEqual([2, 3, 4, 5]);
    expect(TAMAGOTCHI_ANIMATED_BATCHES.jurassic).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(TAMAGOTCHI_ANIMATED_BATCHES.cretaceous).toEqual([18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  });

  test("builds prototype artifact paths for animated species rollout", () => {
    expect(getAnimatedPrototypeAnchorOutputPath("C:/repo", 2, "adult")).toBe(
      "C:/repo/.artifacts/tamagotchi/002/prototype/anchors/adult-anchor.png"
    );
    expect(getAnimatedPrototypeExploratoryOutputPath("C:/repo", 2, "juvenile", "sleepy")).toBe(
      "C:/repo/.artifacts/tamagotchi/002/prototype/exploratory/juvenile-sleepy-exploratory.png"
    );
    expect(getAnimatedPrototypeSpriteOutputPath("C:/repo", 2, "adult", "happy")).toBe(
      "C:/repo/public/tamagotchi/002/adult-happy.png"
    );
    expect(getAnimatedPrototypeMetadataPath("C:/repo", 2)).toBe(
      "C:/repo/.artifacts/tamagotchi/002/prototype/metadata.json"
    );
  });

  test("writes prompt and log artifacts per era batch", () => {
    expect(getAnimatedBatchPromptPath("C:/repo", "triassic", "2026-03-30")).toBe(
      "C:/repo/.prompts/2026-03-30-triassic-style-lock-reset-prompts.md"
    );
    expect(getAnimatedBatchLogPath("C:/repo", "triassic", "2026-03-30")).toBe(
      "C:/repo/.logs/2026-03-30-triassic-style-lock-reset.md"
    );
  });

  test("formats artifact dates from injected dates instead of hardcoded wall clock values", () => {
    expect(getAnimatedArtifactDate(new Date("2026-03-30T10:00:00+11:00"))).toBe("2026-03-30");
  });

  test("builds fresh style-lock anchor references from 001-002 stage sprites", () => {
    expect(getStyleLockAnchorReferencePaths("C:/repo", "adult")).toEqual([
      "C:/repo/public/tamagotchi/001/adult.png",
      "C:/repo/public/tamagotchi/002/adult.png",
    ]);
  });

  test("splits anchor and final prompts into style, species, and stage-specific guidance blocks", () => {
    const species = { id: 3, name: "Plateosaurus", era: "triassic" } as const;

    expect(buildAnimatedAnchorPrompt(species, "adult")).toContain("Style-lock family: #001 + #002 (001-002).");
    expect(buildAnimatedAnchorPrompt(species, "adult")).toContain("Species target: #003 Plateosaurus.");
    expect(buildAnimatedAnchorPrompt(species, "adult")).toContain("Stage target: adult.");

    expect(buildAnimatedFinalPrompt(species, "adult", "happy")).toContain("Style-lock family: #001 + #002 (001-002).");
    expect(buildAnimatedFinalPrompt(species, "adult", "happy")).toContain("Species target: #003 Plateosaurus.");
    expect(buildAnimatedFinalPrompt(species, "adult", "happy")).toContain("Mood target: happy.");
  });

  test("requires explicit style-lock-reset mode and keeps the default triassic reset targets away from reference species", () => {
    expect(() => parseAnimatedRolloutArgs(["--era", "triassic"])).toThrow(
      "Expected --mode style-lock-reset for this rollout."
    );

    expect(parseAnimatedRolloutArgs(["--mode", "style-lock-reset", "--era", "triassic"])).toEqual({
      mode: "style-lock-reset",
      batch: "triassic",
      speciesIds: [3, 4, 5],
    });
  });

  test("rejects unsupported rollout modes instead of silently ignoring them", () => {
    expect(() => parseAnimatedRolloutArgs(["--mode", "animated-rollout", "--era", "triassic"])).toThrow(
      "Unsupported rollout mode: animated-rollout"
    );
  });

  test("rejects unsupported eras", () => {
    expect(() => parseAnimatedRolloutArgs(["--mode", "style-lock-reset", "--era", "permian"])).toThrow(
      "Unsupported era batch: permian"
    );
  });

  test("rejects an empty species override", () => {
    expect(() => parseAnimatedRolloutArgs(["--mode", "style-lock-reset", "--era", "triassic", "--species", ""])).toThrow(
      "Expected a comma-separated species list after --species"
    );
  });

  test("builds prototype metadata by composing shared approval fields with reset workflow metadata", () => {
    expect(
      buildAnimatedPrototypeMetadata({
        speciesId: 3,
        speciesName: "Plateosaurus",
        era: "triassic",
        generatedAt: "2026-03-30T00:00:00.000Z",
        batch: "triassic",
      })
    ).toEqual({
      speciesId: 3,
      speciesName: "Plateosaurus",
      era: "triassic",
      generatedAt: "2026-03-30T00:00:00.000Z",
      sourceMode: "direct-gemini-api",
      model: expect.any(String),
      batch: "triassic",
      anchors: [],
      exploratory: [],
      finalStrips: [],
      animationApproved: false,
      resetWorkflow: {
        mode: "style-lock-reset",
        anchorSourceMode: "fresh-gemini",
        anchorReferenceSpecies: [1, 2],
        anchorNormalization: "stage-normalized",
      },
    });
  });

  test("emits prompt artifacts with the enforced reset command contract and normalized-anchor workflow", () => {
    const promptArtifact = buildAnimatedBatchPromptArtifact("triassic", [3, 4, 5]);

    expect(promptArtifact).toContain(
      "Intended command contract: `bun run scripts/tamagotchi-animated-rollout.ts --mode style-lock-reset --era triassic`"
    );
    expect(promptArtifact).toContain("Default reset targets for `--era triassic`: `#003`, `#004`, `#005`");
    expect(promptArtifact).toContain(
      "Strip white, then normalize each fresh anchor onto its target stage canvas before it becomes a reference."
    );
    expect(promptArtifact).toContain("- Strip white and normalize the fresh anchor onto the target stage canvas.");
  });

  test("keeps prompt artifact default reset targets pinned to the era contract even for subset runs", () => {
    const promptArtifact = buildAnimatedBatchPromptArtifact("triassic", [4]);

    expect(promptArtifact).toContain("Default reset targets for `--era triassic`: `#003`, `#004`, `#005`");
    expect(promptArtifact).not.toContain("Default reset targets for `--era triassic`: `#004`");
  });

  test("emits log artifacts with the reviewed reset workflow guidance", () => {
    const logArtifact = buildAnimatedBatchLogArtifact("triassic", "2026-03-30", [
      buildAnimatedPrototypeMetadata({
        speciesId: 3,
        speciesName: "Plateosaurus",
        era: "triassic",
        generatedAt: "2026-03-30T00:00:00.000Z",
        batch: "triassic",
      }),
    ]);

    expect(logArtifact).toContain(
      "The rollout CLI now requires `--mode style-lock-reset`; the default triassic reset target set is `#003-#005`, so an unqualified triassic reset cannot include reference species `#002`."
    );
    expect(logArtifact).toContain(
      "Fresh Gemini anchors are now white-stripped and stage-normalized onto the target 256x256 stage canvas before they become references for exploratory or final generation."
    );
    expect(logArtifact).toContain(
      "Prototype metadata now uses a clearer composed contract: shared approval fields plus a nested `resetWorkflow` block describing mode, reference species, and anchor normalization."
    );
  });

  test("normalizes generated anchors onto the canonical stage canvas before reuse", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dinodex-anchor-test-"));
    tempDirs.push(tempDir);
    const inputPath = join(tempDir, "input.png");
    const outputPath = join(tempDir, "output.png");

    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 64,
              height: 64,
              channels: 4,
              background: { r: 30, g: 90, b: 40, alpha: 1 },
            },
          }).png().toBuffer(),
          left: 170,
          top: 24,
        },
      ])
      .png()
      .toFile(inputPath);

    await normalizeGeneratedAnchor(inputPath, outputPath, "adult");

    expect(existsSync(outputPath)).toBe(true);
    const image = sharp(outputPath);
    const metadata = await image.metadata();
    expect(metadata.width).toBe(256);
    expect(metadata.height).toBe(256);

    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let minX = info.width;
    let maxX = 0;
    let minY = info.height;
    let maxY = 0;

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const alpha = data[((y * info.width) + x) * 4 + 3];
        if (alpha === 0) {
          continue;
        }
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }

    expect(minX).toBeLessThan(80);
    expect(maxX).toBeGreaterThan(170);
    expect(minY).toBeGreaterThan(0);
    expect(maxY).toBeGreaterThan(180);
  });

  test("prepares generated anchors by stripping white before stage normalization", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dinodex-anchor-prep-test-"));
    tempDirs.push(tempDir);
    const inputPath = join(tempDir, "raw-anchor.png");
    const outputPath = join(tempDir, ".artifacts", "tamagotchi", "003", "prototype", "anchors", "juvenile-anchor.png");

    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 72,
              height: 52,
              channels: 4,
              background: { r: 55, g: 120, b: 65, alpha: 1 },
            },
          }).png().toBuffer(),
          left: 164,
          top: 32,
        },
      ])
      .png()
      .toFile(inputPath);

    await prepareGeneratedAnchorForReuse(inputPath, outputPath, "juvenile");

    const { data, info } = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(256);
    expect(info.height).toBe(256);
    expect(data[3]).toBe(0);

    let opaquePixels = 0;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 0) {
        opaquePixels += 1;
      }
    }
    expect(opaquePixels).toBeGreaterThan(1000);
  });

  test("writes stripped-anchor intermediates to the transient raw area instead of the final anchor directory", () => {
    expect(getAnchorTransientPath("C:/repo", 3, "juvenile", "stripped")).toBe(
      "C:/repo/.artifacts/tamagotchi/003/prototype/raw/juvenile-anchor/juvenile-anchor-stripped.png"
    );
  });

  test("fails fast when a style-lock reference sprite is missing", () => {
    expect(() =>
      ensureStyleLockReferencePathsExist(["C:/repo/public/tamagotchi/001/adult.png", "C:/repo/public/tamagotchi/002/adult.png"], (path) =>
        path.endsWith("/001/adult.png")
      )
    ).toThrow("Missing style-lock reference sprite: C:/repo/public/tamagotchi/002/adult.png");
  });

  test("rejects degenerate anchors with no visible subject after stripping", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dinodex-anchor-invalid-test-"));
    tempDirs.push(tempDir);
    const inputPath = join(tempDir, "invalid-anchor.png");
    const outputPath = join(tempDir, ".artifacts", "tamagotchi", "003", "prototype", "anchors", "adult-anchor.png");

    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toFile(inputPath);

    await expect(prepareGeneratedAnchorForReuse(inputPath, outputPath, "adult")).rejects.toThrow(
      "No visible pixels found in anchor source."
    );
  });
});
