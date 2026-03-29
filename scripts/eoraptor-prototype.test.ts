import { describe, expect, test } from "bun:test";
import {
  EORAPTOR_FRAME_SIZE,
  EORAPTOR_PROTOTYPE_ANIMATION_STATES,
  EORAPTOR_PROTOTYPE_ID,
  EORAPTOR_PROTOTYPE_STAGES,
  EORAPTOR_STAGE_NORMALIZATION,
  EORAPTOR_STRIP_FRAME_COUNT,
  buildEoraptorPrototypeOutputPlan,
  getEoraptorPrototypeAnchorOutputPath,
  getEoraptorPrototypeExploratoryOutputPath,
  getEoraptorPrototypeMetadataPath,
  getEoraptorPrototypePoses,
  getEoraptorPrototypeSourcePath,
  getEoraptorPrototypeSpriteOutputPath,
  getEoraptorPrototypeSpriteUrl,
} from "./eoraptor-prototype";

describe("Eoraptor prototype sprite helpers", () => {
  test("declares the fixed prototype matrix", () => {
    expect(EORAPTOR_PROTOTYPE_ID).toBe(1);
    expect(EORAPTOR_FRAME_SIZE).toBe(256);
    expect(EORAPTOR_STRIP_FRAME_COUNT).toBe(4);
    expect(EORAPTOR_PROTOTYPE_STAGES).toEqual(["hatchling", "juvenile", "adult"]);
    expect(EORAPTOR_PROTOTYPE_ANIMATION_STATES).toEqual(["idle", "happy", "sleepy", "sick"]);
  });

  test("builds the expected source, anchor, exploratory, and final output paths", () => {
    expect(getEoraptorPrototypeSourcePath("C:/repo", "adult")).toBe("C:/repo/public/tamagotchi/001/adult.png");
    expect(getEoraptorPrototypeAnchorOutputPath("C:/repo", "adult")).toBe(
      "C:/repo/public/tamagotchi/001/prototype/anchors/adult-anchor.png"
    );
    expect(getEoraptorPrototypeExploratoryOutputPath("C:/repo", "juvenile", "sleepy")).toBe(
      "C:/repo/public/tamagotchi/001/prototype/exploratory/juvenile-sleepy-exploratory.png"
    );
    expect(getEoraptorPrototypeSpriteOutputPath("C:/repo", "adult", "happy")).toBe(
      "C:/repo/public/tamagotchi/001/adult-happy.png"
    );
    expect(getEoraptorPrototypeSpriteUrl("juvenile", "sleepy")).toBe("/tamagotchi/001/juvenile-sleepy.png");
    expect(getEoraptorPrototypeMetadataPath("C:/repo")).toBe("C:/repo/public/tamagotchi/001/prototype/metadata.json");
  });

  test("exposes normalized pose data for both exploratory and final strips", () => {
    const finalIdle = getEoraptorPrototypePoses("idle", "final");
    const exploratoryHappy = getEoraptorPrototypePoses("happy", "exploratory");

    expect(finalIdle).toHaveLength(4);
    expect(exploratoryHappy).toHaveLength(4);
    expect(finalIdle[2]?.blink).toBe("closed");
    expect(exploratoryHappy[1]?.rotation).toBeLessThan(finalIdle[1]?.rotation ?? 0);
  });

  test("defines stable stage normalization targets", () => {
    expect(EORAPTOR_STAGE_NORMALIZATION.hatchling.targetBox).toBeLessThan(
      EORAPTOR_STAGE_NORMALIZATION.juvenile.targetBox
    );
    expect(EORAPTOR_STAGE_NORMALIZATION.juvenile.targetBox).toBeLessThan(
      EORAPTOR_STAGE_NORMALIZATION.adult.targetBox
    );
    expect(EORAPTOR_STAGE_NORMALIZATION.adult.baselineY).toBeGreaterThan(
      EORAPTOR_STAGE_NORMALIZATION.hatchling.baselineY
    );
  });

  test("builds the full prototype output plan", () => {
    const plan = buildEoraptorPrototypeOutputPlan("C:/repo");

    expect(plan.anchors).toHaveLength(3);
    expect(plan.exploratory).toHaveLength(12);
    expect(plan.finalStrips).toHaveLength(12);
    expect(plan.finalStrips).toContain("C:/repo/public/tamagotchi/001/hatchling-idle.png");
    expect(plan.finalStrips).toContain("C:/repo/public/tamagotchi/001/adult-sick.png");
    expect(plan.metadataPath).toBe("C:/repo/public/tamagotchi/001/prototype/metadata.json");
  });
});
