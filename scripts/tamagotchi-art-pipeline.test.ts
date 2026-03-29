import { describe, expect, test } from "bun:test";
import {
  getEggVariantKey,
  getTamagotchiManifestPath,
  getTamagotchiSpriteOutputPath,
  getTamagotchiSpriteUrl,
  getTamagotchiStageList,
  padTamagotchiId,
} from "./tamagotchi-art-pipeline";

describe("tamagotchi art pipeline helpers", () => {
  test("pads ids and builds the new public asset tree", () => {
    expect(padTamagotchiId(1)).toBe("001");
    expect(getTamagotchiSpriteOutputPath("C:/repo", 18, "egg")).toBe(
      "C:/repo/public/tamagotchi/018/egg.png"
    );
    expect(getTamagotchiSpriteOutputPath("C:/repo", 18, "adult")).toBe(
      "C:/repo/public/tamagotchi/018/adult.png"
    );
    expect(getTamagotchiManifestPath("C:/repo")).toBe("C:/repo/public/tamagotchi/manifest.json");
  });

  test("emits stable public urls and stage ordering", () => {
    expect(getTamagotchiSpriteUrl(18, "egg")).toBe("/tamagotchi/018/egg.png");
    expect(getTamagotchiStageList()).toEqual(["egg", "hatchling", "juvenile", "adult"]);
  });

  test("assigns stable egg variants by species id", () => {
    expect(getEggVariantKey(1)).toBe("banded");
    expect(getEggVariantKey(2)).toBe("speckled");
    expect(getEggVariantKey(6)).toBe("banded");
  });
});
