import { describe, expect, test } from "bun:test";
import { getTamagotchiEggSheet, getTamagotchiSpriteSheet } from "./tamagotchi-sprites";

describe("tamagotchi sprite descriptors", () => {
  test("uses mood-aware multi-frame sheets for Eoraptor prototype stages", () => {
    const sprite = getTamagotchiSpriteSheet(1, "adult", "happy");

    expect(sprite.expectedSrc).toBe("/tamagotchi/001/adult-happy.png");
    expect(sprite.expectedFrameCount).toBe(4);
    expect(sprite.fallbackFrameCount).toBe(4);
    expect(sprite.frameDurationMs).toBe(170);
  });

  test("treats shipped stage art as a single-frame PNG with animated fallback frames", () => {
    const sprite = getTamagotchiSpriteSheet(18, "adult", "idle");

    expect(sprite.expectedSrc).toBe("/tamagotchi/018/adult.png");
    expect(sprite.expectedFrameCount).toBe(1);
    expect(sprite.fallbackFrameCount).toBe(4);
  });

  test("uses manifest-backed mood-aware strips for shipped non-Eoraptor animated species", () => {
    const sprite = getTamagotchiSpriteSheet(2, "adult", "happy");

    expect(sprite.expectedSrc).toBe("/tamagotchi/002/adult-happy.png");
    expect(sprite.expectedFrameCount).toBe(4);
    expect(sprite.fallbackFrameCount).toBe(4);
    expect(sprite.frameDurationMs).toBe(170);
  });

  test("points egg art at the generated species sprite and keeps animated fallback frames", () => {
    const egg = getTamagotchiEggSheet(18, 12345);

    expect(egg.expectedSrc).toBe("/tamagotchi/018/egg.png");
    expect(egg.expectedFrameCount).toBe(1);
    expect(egg.fallbackFrameCount).toBe(4);
  });
});
