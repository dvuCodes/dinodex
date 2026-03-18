import { describe, expect, test } from "bun:test";
import {
  findPreferredArtSourcePath,
  getTransparentOutputPath,
  getRawOutputPath,
} from "./art-pipeline";

describe("art pipeline source precedence", () => {
  test("prefers transparent output over raw-output assets", () => {
    const root = "C:/repo";
    const existingPaths = new Set([
      "C:/repo/scripts/transparent-output/001/adult.png",
      "C:/repo/scripts/raw-output/001/adult.png",
    ]);

    const resolved = findPreferredArtSourcePath(root, 1, "adult", (candidate) =>
      existingPaths.has(candidate)
    );

    expect(resolved).toBe("C:/repo/scripts/transparent-output/001/adult.png");
  });

  test("falls back through raw-output extensions when no transparent edit exists", () => {
    const root = "C:/repo";
    const existingPaths = new Set(["C:/repo/scripts/raw-output/001/juvenile.webp"]);

    const resolved = findPreferredArtSourcePath(root, 1, "juvenile", (candidate) =>
      existingPaths.has(candidate)
    );

    expect(resolved).toBe("C:/repo/scripts/raw-output/001/juvenile.webp");
  });

  test("returns null when no source asset exists", () => {
    const resolved = findPreferredArtSourcePath("C:/repo", 1, "hatchling", () => false);

    expect(resolved).toBeNull();
  });
});

describe("art pipeline path helpers", () => {
  test("builds transparent and raw output paths with padded ids", () => {
    expect(getTransparentOutputPath("C:/repo", 1, "adult")).toBe(
      "C:/repo/scripts/transparent-output/001/adult.png"
    );
    expect(getRawOutputPath("C:/repo", 1, "adult", "png")).toBe(
      "C:/repo/scripts/raw-output/001/adult.png"
    );
  });
});
