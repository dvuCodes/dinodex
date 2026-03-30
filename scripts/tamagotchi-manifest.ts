import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import dinos from "../src/data/dinos.json";
import type { DinoEntry, Stage } from "../src/lib/types";
import type { TamagotchiAnimationState } from "../src/lib/tamagotchi";
import {
  getEggVariantKey,
  getTamagotchiManifestPath,
  getTamagotchiMoodSpriteOutputPath,
  getTamagotchiSpriteOutputPath,
  getTamagotchiSpriteUrl,
  getTamagotchiStageList,
  padTamagotchiId,
  type TamagotchiStage,
} from "./tamagotchi-art-pipeline";
import {
  STYLE_LOCK_MOODS,
  STYLE_LOCK_STAGES,
  hasExplicitAnimatedApproval,
  isAnimatedSpeciesApproved,
  type AnimatedApprovalMetadata,
} from "./tamagotchi-style-lock";

export const TAMAGOTCHI_MANIFEST_VERSION = 3;
export const TAMAGOTCHI_SPRITE_SIZE = 256;
export const TAMAGOTCHI_SOURCE_GRID_SIZE = 64;
export const TAMAGOTCHI_ANIMATION_STAGES: Stage[] = [...STYLE_LOCK_STAGES];
export const TAMAGOTCHI_ANIMATION_STATES: TamagotchiAnimationState[] = [...STYLE_LOCK_MOODS];
const DINO_ENTRIES = dinos as DinoEntry[];

export interface ManifestSpriteEntry {
  stage: TamagotchiStage;
  url: string;
}

export interface ManifestAnimationEntry {
  frameCount: number;
  stages: Stage[];
  moods: TamagotchiAnimationState[];
}

export type ManifestAnimationPrototypeMetadataStatus =
  | "missing"
  | "read_error"
  | "parse_error"
  | "invalid"
  | "present";

export interface ManifestAnimationPrototypeEntry {
  hasMoodStrips: boolean;
  metadataStatus: ManifestAnimationPrototypeMetadataStatus;
  isApproved: boolean;
  error?: string;
}

export interface ManifestSpeciesEntry {
  id: number;
  name: string;
  eggVariant: string;
  sprites: ManifestSpriteEntry[];
  animation?: ManifestAnimationEntry;
  animationPrototype: ManifestAnimationPrototypeEntry;
}

export interface ManifestFile {
  version: number;
  generatedAt: string;
  spriteSize: number;
  sourceGridSize: number;
  stageOrder: TamagotchiStage[];
  species: ManifestSpeciesEntry[];
}

function getDinoEntry(dinoId: number): DinoEntry {
  const entry = DINO_ENTRIES.find((dino) => dino.id === dinoId);
  if (!entry) {
    throw new Error(`Missing dino data for ${dinoId}`);
  }

  return entry;
}

function hasBaseStageSprites(projectRoot: string, dinoId: number, exists: typeof existsSync): boolean {
  return getTamagotchiStageList().every((stage) => exists(getTamagotchiSpriteOutputPath(projectRoot, dinoId, stage)));
}

function hasAnimatedMoodStrips(projectRoot: string, dinoId: number, exists: typeof existsSync): boolean {
  return TAMAGOTCHI_ANIMATION_STAGES.every((stage) =>
    TAMAGOTCHI_ANIMATION_STATES.every((animationState) =>
      exists(getTamagotchiMoodSpriteOutputPath(projectRoot, dinoId, stage, animationState))
    )
  );
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function getAnimatedPrototypeMetadataPaths(projectRoot: string, dinoId: number): string[] {
  return [
    normalizePath(join(projectRoot, ".artifacts", "tamagotchi", padTamagotchiId(dinoId), "prototype", "metadata.json")),
    normalizePath(join(projectRoot, "public", "tamagotchi", padTamagotchiId(dinoId), "prototype", "metadata.json")),
  ];
}

function readAnimatedApprovalMetadata(
  projectRoot: string,
  dinoId: number,
  exists: typeof existsSync,
  readFile: typeof readFileSync
): ManifestAnimationPrototypeEntry {
  const hasMoodStrips = hasAnimatedMoodStrips(projectRoot, dinoId, exists);
  const metadataPath = getAnimatedPrototypeMetadataPaths(projectRoot, dinoId).find((candidatePath) => exists(candidatePath));

  if (!metadataPath) {
    return {
      hasMoodStrips,
      metadataStatus: "missing",
      isApproved: false,
    };
  }

  try {
    const rawMetadata = readFile(metadataPath, "utf-8");

    try {
      const parsedMetadata = JSON.parse(rawMetadata) as unknown;
      if (!hasExplicitAnimatedApproval(parsedMetadata)) {
        return {
          hasMoodStrips,
          metadataStatus: "invalid",
          isApproved: false,
          error: "Prototype metadata must include a boolean animationApproved field.",
        };
      }

      const metadata = parsedMetadata as AnimatedApprovalMetadata;
      return {
        hasMoodStrips,
        metadataStatus: "present",
        isApproved: isAnimatedSpeciesApproved(metadata),
      };
    } catch (error) {
      return {
        hasMoodStrips,
        metadataStatus: "parse_error",
        isApproved: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  } catch (error) {
    return {
      hasMoodStrips,
      metadataStatus: "read_error",
      isApproved: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function buildManifestEntry(
  projectRoot: string,
  dinoId: number,
  exists: typeof existsSync = existsSync,
  readFile: typeof readFileSync = readFileSync
): ManifestSpeciesEntry {
  if (!hasBaseStageSprites(projectRoot, dinoId, exists)) {
    throw new Error(`Missing base Tamagotchi stage sprites for #${String(dinoId).padStart(3, "0")}`);
  }

  const dino = getDinoEntry(dinoId);
  const sprites: ManifestSpriteEntry[] = getTamagotchiStageList().map((stage) => ({
    stage,
    url: getTamagotchiSpriteUrl(dinoId, stage),
  }));

  const animationPrototype = readAnimatedApprovalMetadata(projectRoot, dinoId, exists, readFile);
  const animation = animationPrototype.hasMoodStrips && animationPrototype.isApproved
    ? {
        frameCount: 4,
        stages: [...TAMAGOTCHI_ANIMATION_STAGES],
        moods: [...TAMAGOTCHI_ANIMATION_STATES],
      }
    : undefined;

  return {
    id: dinoId,
    name: dino.name,
    eggVariant: getEggVariantKey(dinoId),
    sprites,
    animation,
    animationPrototype,
  };
}

export function buildTamagotchiManifest(
  projectRoot: string,
  exists: typeof existsSync = existsSync
): ManifestFile {
  return {
    version: TAMAGOTCHI_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    spriteSize: TAMAGOTCHI_SPRITE_SIZE,
    sourceGridSize: TAMAGOTCHI_SOURCE_GRID_SIZE,
    stageOrder: getTamagotchiStageList(),
    species: DINO_ENTRIES.map((entry) => buildManifestEntry(projectRoot, entry.id, exists)),
  };
}

export function writeTamagotchiManifest(projectRoot: string): string {
  const manifestPath = getTamagotchiManifestPath(projectRoot);
  const manifest = buildTamagotchiManifest(projectRoot);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  return manifestPath;
}
