import { join } from "node:path";
import type { Stage } from "../src/lib/types";

const NORMALIZED_STAGES: Array<"egg" | Stage> = ["egg", "hatchling", "juvenile", "adult"];

export type TamagotchiStage = (typeof NORMALIZED_STAGES)[number];

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function padTamagotchiId(id: number): string {
  return String(id).padStart(3, "0");
}

export function getTamagotchiSpriteOutputPath(
  projectRoot: string,
  dinoId: number,
  stage: TamagotchiStage
): string {
  return normalizePath(join(projectRoot, "public", "tamagotchi", padTamagotchiId(dinoId), `${stage}.png`));
}

export function getTamagotchiManifestPath(projectRoot: string): string {
  return normalizePath(join(projectRoot, "public", "tamagotchi", "manifest.json"));
}

export function getTamagotchiSpriteUrl(dinoId: number, stage: TamagotchiStage): string {
  return `/tamagotchi/${padTamagotchiId(dinoId)}/${stage}.png`;
}

export function getTamagotchiStageList(): TamagotchiStage[] {
  return [...NORMALIZED_STAGES];
}

export function getEggVariantKey(dinoId: number): string {
  const variants = ["banded", "speckled", "ringed", "zigzag", "swirled"] as const;
  return variants[(dinoId - 1) % variants.length];
}
