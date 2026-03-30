import { describe, expect, test } from "bun:test";
import { buildManifestEntry } from "./tamagotchi-manifest";
import {
  STYLE_LOCK_REFERENCE_SPECIES,
  buildSpeciesPromptBlock,
  buildStyleLockPromptBlock,
  hasExplicitAnimatedApproval,
  isAnimatedSpeciesApproved,
} from "./tamagotchi-style-lock";

describe("tamagotchi style lock helpers", () => {
  test("keeps the canonical family reference pinned to species 001 and 002", () => {
    expect(STYLE_LOCK_REFERENCE_SPECIES).toEqual([1, 2]);
  });

  test("builds the shared style block with the locked visual rules", () => {
    const promptBlock = buildStyleLockPromptBlock();

    expect(promptBlock).toContain("001");
    expect(promptBlock).toContain("002");
    expect(promptBlock).toContain("silhouette");
    expect(promptBlock).toContain("pixel-cluster");
    expect(promptBlock).toContain("PURE SOLID WHITE background");
  });

  test("requires explicit approval metadata before a species is treated as animated", () => {
    expect(hasExplicitAnimatedApproval(undefined)).toBeFalse();
    expect(hasExplicitAnimatedApproval({})).toBeFalse();
    expect(hasExplicitAnimatedApproval({ animationApproved: "true" })).toBeFalse();
    expect(hasExplicitAnimatedApproval({ animationApproved: true })).toBeTrue();
    expect(isAnimatedSpeciesApproved(undefined)).toBeFalse();
    expect(isAnimatedSpeciesApproved({})).toBeFalse();
    expect(isAnimatedSpeciesApproved({ animationApproved: false })).toBeFalse();
    expect(isAnimatedSpeciesApproved({ animationApproved: true })).toBeTrue();
  });

  test("builds a species prompt block without repeating the shared style block", () => {
    const styleBlock = buildStyleLockPromptBlock();
    const speciesBlock = buildSpeciesPromptBlock({ id: 2, name: "Coelophysis", era: "triassic" });

    expect(speciesBlock).toContain("Coelophysis");
    expect(speciesBlock).toContain("triassic");
    expect(speciesBlock).not.toContain(styleBlock);
    expect(speciesBlock).not.toContain("PURE SOLID WHITE background");
  });
});

describe("tamagotchi manifest animation gating", () => {
  test("only marks a species as animated when strips exist and metadata is explicitly approved", () => {
    const projectRoot = "C:/repo";
    const approvedMetadata = JSON.stringify({ animationApproved: true });
    const existingPaths = new Set([
      "C:/repo/public/tamagotchi/002/egg.png",
      "C:/repo/public/tamagotchi/002/hatchling.png",
      "C:/repo/public/tamagotchi/002/juvenile.png",
      "C:/repo/public/tamagotchi/002/adult.png",
      "C:/repo/public/tamagotchi/002/prototype/metadata.json",
      "C:/repo/public/tamagotchi/002/hatchling-idle.png",
      "C:/repo/public/tamagotchi/002/hatchling-happy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sleepy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sick.png",
      "C:/repo/public/tamagotchi/002/juvenile-idle.png",
      "C:/repo/public/tamagotchi/002/juvenile-happy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sleepy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sick.png",
      "C:/repo/public/tamagotchi/002/adult-idle.png",
      "C:/repo/public/tamagotchi/002/adult-happy.png",
      "C:/repo/public/tamagotchi/002/adult-sleepy.png",
      "C:/repo/public/tamagotchi/002/adult-sick.png",
    ]);

    const exists = (path: string) => existingPaths.has(path);
    const approvedEntry = buildManifestEntry(projectRoot, 2, exists, () => approvedMetadata);

    expect(approvedEntry.animation).toEqual({
      frameCount: 4,
      stages: ["hatchling", "juvenile", "adult"],
      moods: ["idle", "happy", "sleepy", "sick"],
    });
    expect(approvedEntry.animationPrototype).toEqual({
      hasMoodStrips: true,
      metadataStatus: "present",
      isApproved: true,
    });
  });

  test("keeps missing metadata distinct from present-but-unapproved metadata", () => {
    const projectRoot = "C:/repo";
    const unapprovedMetadata = JSON.stringify({ animationApproved: false });
    const baseAndAnimatedPaths = new Set([
      "C:/repo/public/tamagotchi/002/egg.png",
      "C:/repo/public/tamagotchi/002/hatchling.png",
      "C:/repo/public/tamagotchi/002/juvenile.png",
      "C:/repo/public/tamagotchi/002/adult.png",
      "C:/repo/public/tamagotchi/002/hatchling-idle.png",
      "C:/repo/public/tamagotchi/002/hatchling-happy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sleepy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sick.png",
      "C:/repo/public/tamagotchi/002/juvenile-idle.png",
      "C:/repo/public/tamagotchi/002/juvenile-happy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sleepy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sick.png",
      "C:/repo/public/tamagotchi/002/adult-idle.png",
      "C:/repo/public/tamagotchi/002/adult-happy.png",
      "C:/repo/public/tamagotchi/002/adult-sleepy.png",
      "C:/repo/public/tamagotchi/002/adult-sick.png",
    ]);
    const unapprovedEntry = buildManifestEntry(
      projectRoot,
      2,
      (path) => path === "C:/repo/.artifacts/tamagotchi/002/prototype/metadata.json" || baseAndAnimatedPaths.has(path),
      () => unapprovedMetadata
    );
    const missingMetadataEntry = buildManifestEntry(projectRoot, 2, (path) => baseAndAnimatedPaths.has(path));

    expect(unapprovedEntry.animation).toBeUndefined();
    expect(unapprovedEntry.animationPrototype).toEqual({
      hasMoodStrips: true,
      metadataStatus: "present",
      isApproved: false,
    });
    expect(missingMetadataEntry.animation).toBeUndefined();
    expect(missingMetadataEntry.animationPrototype).toEqual({
      hasMoodStrips: true,
      metadataStatus: "missing",
      isApproved: false,
    });
  });

  test("reports parse and read failures without advertising animation", () => {
    const projectRoot = "C:/repo";
    const baseAndAnimatedPaths = new Set([
      "C:/repo/public/tamagotchi/002/egg.png",
      "C:/repo/public/tamagotchi/002/hatchling.png",
      "C:/repo/public/tamagotchi/002/juvenile.png",
      "C:/repo/public/tamagotchi/002/adult.png",
      "C:/repo/public/tamagotchi/002/prototype/metadata.json",
      "C:/repo/public/tamagotchi/002/hatchling-idle.png",
      "C:/repo/public/tamagotchi/002/hatchling-happy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sleepy.png",
      "C:/repo/public/tamagotchi/002/hatchling-sick.png",
      "C:/repo/public/tamagotchi/002/juvenile-idle.png",
      "C:/repo/public/tamagotchi/002/juvenile-happy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sleepy.png",
      "C:/repo/public/tamagotchi/002/juvenile-sick.png",
      "C:/repo/public/tamagotchi/002/adult-idle.png",
      "C:/repo/public/tamagotchi/002/adult-happy.png",
      "C:/repo/public/tamagotchi/002/adult-sleepy.png",
      "C:/repo/public/tamagotchi/002/adult-sick.png",
    ]);
    const exists = (path: string) => baseAndAnimatedPaths.has(path);

    const parseErrorEntry = buildManifestEntry(projectRoot, 2, exists, () => "{");
    const readErrorEntry = buildManifestEntry(projectRoot, 2, exists, () => {
      throw new Error("disk offline");
    });

    expect(parseErrorEntry.animation).toBeUndefined();
    expect(parseErrorEntry.animationPrototype?.metadataStatus).toBe("parse_error");
    expect(parseErrorEntry.animationPrototype?.error).toContain("Expected");
    expect(readErrorEntry.animation).toBeUndefined();
    expect(readErrorEntry.animationPrototype).toEqual({
      hasMoodStrips: true,
      metadataStatus: "read_error",
      isApproved: false,
      error: "disk offline",
    });
  });

  test("reports invalid metadata and missing strips separately", () => {
    const projectRoot = "C:/repo";
    const metadataPath = "C:/repo/.artifacts/tamagotchi/002/prototype/metadata.json";
    const baseOnlyPaths = new Set([
      "C:/repo/public/tamagotchi/002/egg.png",
      "C:/repo/public/tamagotchi/002/hatchling.png",
      "C:/repo/public/tamagotchi/002/juvenile.png",
      "C:/repo/public/tamagotchi/002/adult.png",
      metadataPath,
    ]);

    const invalidMetadataEntry = buildManifestEntry(projectRoot, 2, (path) => baseOnlyPaths.has(path), () =>
      JSON.stringify({ approvedAt: "2026-03-30" })
    );

    expect(invalidMetadataEntry.animation).toBeUndefined();
    expect(invalidMetadataEntry.animationPrototype).toEqual({
      hasMoodStrips: false,
      metadataStatus: "invalid",
      isApproved: false,
      error: "Prototype metadata must include a boolean animationApproved field.",
    });
  });
});
