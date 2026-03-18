import { describe, expect, test } from "bun:test";
import {
  buildTransparencyEditPrompt,
  createPilotTasks,
  resolveEditBackend,
  shouldPreferAiEdits,
  stripEdgeConnectedNearWhiteBackground,
  shouldAcceptTransparencyEdit,
  type TransparencyValidationMetrics,
} from "./edit-art-transparent";

describe("buildTransparencyEditPrompt", () => {
  test("locks the edit to background removal while preserving the current subject", () => {
    const prompt = buildTransparencyEditPrompt();

    expect(prompt).toContain("Edit this exact image only.");
    expect(prompt).toContain("Preserve the dinosaur's pose");
    expect(prompt).toContain("Remove only the background and negative-space fill");
    expect(prompt).toContain("transparent background");
    expect(prompt).toContain("Do not redesign, restyle, relight, crop, sharpen, repaint, or add/remove features.");
  });
});

describe("shouldAcceptTransparencyEdit", () => {
  test("accepts edits that add alpha, remove white background, and preserve fidelity", () => {
    const metrics: TransparencyValidationMetrics = {
      transparentPixels: 100_000,
      rawOpaqueNearWhitePixels: 800_000,
      editedOpaqueNearWhitePixels: 20_000,
      meanAbsoluteChannelDelta: 2.1,
      boundingBoxShiftPixels: 6,
    };

    expect(shouldAcceptTransparencyEdit(metrics)).toBe(true);
  });

  test("rejects edits with no transparency", () => {
    const metrics: TransparencyValidationMetrics = {
      transparentPixels: 0,
      rawOpaqueNearWhitePixels: 800_000,
      editedOpaqueNearWhitePixels: 20_000,
      meanAbsoluteChannelDelta: 2.1,
      boundingBoxShiftPixels: 6,
    };

    expect(shouldAcceptTransparencyEdit(metrics)).toBe(false);
  });

  test("rejects edits that fail to remove at least ninety percent of opaque near-white pixels", () => {
    const metrics: TransparencyValidationMetrics = {
      transparentPixels: 100_000,
      rawOpaqueNearWhitePixels: 800_000,
      editedOpaqueNearWhitePixels: 120_000,
      meanAbsoluteChannelDelta: 2.1,
      boundingBoxShiftPixels: 6,
    };

    expect(shouldAcceptTransparencyEdit(metrics)).toBe(false);
  });

  test("rejects edits that drift too far from the original render", () => {
    const metrics: TransparencyValidationMetrics = {
      transparentPixels: 100_000,
      rawOpaqueNearWhitePixels: 800_000,
      editedOpaqueNearWhitePixels: 20_000,
      meanAbsoluteChannelDelta: 9.5,
      boundingBoxShiftPixels: 6,
    };

    expect(shouldAcceptTransparencyEdit(metrics)).toBe(false);
  });

  test("rejects edits that move the subject too far", () => {
    const metrics: TransparencyValidationMetrics = {
      transparentPixels: 100_000,
      rawOpaqueNearWhitePixels: 800_000,
      editedOpaqueNearWhitePixels: 20_000,
      meanAbsoluteChannelDelta: 2.1,
      boundingBoxShiftPixels: 20,
    };

    expect(shouldAcceptTransparencyEdit(metrics)).toBe(false);
  });
});

describe("createPilotTasks", () => {
  test("defaults to dino 001 for all stages when no flags are provided", () => {
    expect(createPilotTasks([])).toEqual([
      { dinoId: 1, stage: "hatchling" },
      { dinoId: 1, stage: "juvenile" },
      { dinoId: 1, stage: "adult" },
    ]);
  });

  test("supports stage scoping for a specific dino", () => {
    expect(createPilotTasks(["--dino", "7", "--stage", "adult"])).toEqual([
      { dinoId: 7, stage: "adult" },
    ]);
  });
});

describe("shouldPreferAiEdits", () => {
  test("defaults to deterministic exact-preservation stripping", () => {
    expect(shouldPreferAiEdits([])).toBe(false);
  });

  test("enables the generative edit path only when explicitly requested", () => {
    expect(shouldPreferAiEdits(["--all", "--prefer-ai"])).toBe(true);
  });
});

describe("resolveEditBackend", () => {
  test("prefers infsh when it is available", () => {
    expect(resolveEditBackend({ infshAvailable: true, geminiApiKey: "key" })).toBe("infsh");
  });

  test("falls back to gemini when infsh is unavailable but a Gemini key exists", () => {
    expect(resolveEditBackend({ infshAvailable: false, geminiApiKey: "key" })).toBe("gemini");
  });

  test("throws when neither backend is available", () => {
    expect(() => resolveEditBackend({ infshAvailable: false, geminiApiKey: "" })).toThrow(
      "No available image editing backend"
    );
  });
});

describe("stripEdgeConnectedNearWhiteBackground", () => {
  test("removes edge-connected near-white background while preserving the subject", () => {
    const pixels = new Uint8Array([
      255, 255, 255, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,

      255, 255, 255, 255,
      20, 40, 60, 255,
      255, 255, 255, 255,

      255, 255, 255, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,
    ]);

    const stripped = stripEdgeConnectedNearWhiteBackground(pixels, 3, 3, 4);

    expect(Array.from(stripped.slice(0, 4))).toEqual([255, 255, 255, 0]);
    expect(Array.from(stripped.slice(16, 20))).toEqual([20, 40, 60, 255]);
  });

  test("keeps isolated near-white details that are not connected to the canvas edge", () => {
    const pixels = new Uint8Array([
      255, 255, 255, 255,
      30, 30, 30, 255,
      255, 255, 255, 255,

      30, 30, 30, 255,
      254, 254, 254, 255,
      30, 30, 30, 255,

      255, 255, 255, 255,
      30, 30, 30, 255,
      255, 255, 255, 255,
    ]);

    const stripped = stripEdgeConnectedNearWhiteBackground(pixels, 3, 3, 4);

    expect(Array.from(stripped.slice(16, 20))).toEqual([254, 254, 254, 255]);
    expect(Array.from(stripped.slice(0, 4))).toEqual([255, 255, 255, 0]);
  });
});
