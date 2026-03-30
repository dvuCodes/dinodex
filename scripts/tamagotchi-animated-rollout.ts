import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import dinos from "../src/data/dinos.json";
import type { DinoEntry, Era, Stage } from "../src/lib/types";
import type { TamagotchiAnimationState } from "../src/lib/tamagotchi";
import { stripEdgeConnectedNearWhiteBackground } from "./edit-art-transparent";
import {
  getTamagotchiMoodSpriteOutputPath,
  getTamagotchiSpriteOutputPath,
  padTamagotchiId,
} from "./tamagotchi-art-pipeline";
import {
  TAMAGOTCHI_ANIMATION_STAGES,
  TAMAGOTCHI_ANIMATION_STATES,
  writeTamagotchiManifest,
} from "./tamagotchi-manifest";
import {
  STYLE_LOCK_REFERENCE_SPECIES,
  buildSpeciesPromptBlock,
  buildStyleLockPromptBlock,
  type AnimatedApprovalMetadata,
} from "./tamagotchi-style-lock";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const GEMINI_HELPER = "C:/Users/datvu/.agents/skills/nano-banana-2/gemini_image.py";
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const FRAME_COUNT = 4;
const DINO_ENTRIES = dinos as DinoEntry[];
const SOURCE_ALPHA_THRESHOLD = 8;
const STYLE_LOCK_RESET_MODE = "style-lock-reset";

type RawBufferInfo = {
  data: Buffer<ArrayBufferLike>;
  width: number;
  height: number;
};

type Pose = {
  xOffset: number;
  yOffset: number;
  rotation: number;
  brightness: number;
  saturation: number;
  shadowScale: number;
  shadowOpacity: number;
};

type BatchName = keyof typeof TAMAGOTCHI_ANIMATED_BATCHES;
type RolloutMode = typeof STYLE_LOCK_RESET_MODE;

type StageNormalization = {
  targetBox: number;
  centerX: number;
  baselineY: number;
};

type AnimatedPrototypeWorkflowMetadata = {
  mode: RolloutMode;
  anchorSourceMode: "fresh-gemini";
  anchorReferenceSpecies: number[];
  anchorNormalization: "stage-normalized";
};

export type AnimatedPrototypeMetadata = AnimatedApprovalMetadata & {
  speciesId: number;
  speciesName: string;
  era: Era;
  generatedAt: string;
  sourceMode: "direct-gemini-api";
  model: string;
  batch: BatchName;
  anchors: string[];
  exploratory: string[];
  finalStrips: string[];
  resetWorkflow: AnimatedPrototypeWorkflowMetadata;
};

type PromptSpecies = Pick<DinoEntry, "id" | "name" | "era">;

type GeminiImageOptions = {
  aspectRatio?: string;
  imageSize?: "1K" | "2K" | "4K";
};

type RolloutParseResult = {
  mode: RolloutMode;
  batch: BatchName;
  speciesIds: number[];
};

export const TAMAGOTCHI_ANIMATED_BATCHES = {
  triassic: [2, 3, 4, 5],
  jurassic: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  cretaceous: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
} as const satisfies Record<Era, number[]>;

const STYLE_LOCK_RESET_BATCHES = {
  triassic: [3, 4, 5],
  jurassic: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  cretaceous: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
} as const satisfies Record<Era, number[]>;

const STAGE_NORMALIZATION: Record<Stage, StageNormalization> = {
  hatchling: { targetBox: 168, centerX: 120, baselineY: 212 },
  juvenile: { targetBox: 196, centerX: 128, baselineY: 216 },
  adult: { targetBox: 208, centerX: 128, baselineY: 220 },
};

const EXPLORATORY_POSES: Record<TamagotchiAnimationState, Pose[]> = {
  idle: [
    { xOffset: 0, yOffset: 0, rotation: 0, brightness: 1, saturation: 1, shadowScale: 1, shadowOpacity: 0.18 },
    { xOffset: 3, yOffset: -4, rotation: -4, brightness: 1.03, saturation: 1.03, shadowScale: 0.9, shadowOpacity: 0.14 },
    { xOffset: 0, yOffset: -2, rotation: 0.4, brightness: 1, saturation: 1, shadowScale: 0.95, shadowOpacity: 0.15 },
    { xOffset: -3, yOffset: 1, rotation: 3.8, brightness: 0.98, saturation: 0.98, shadowScale: 1.03, shadowOpacity: 0.19 },
  ],
  happy: [
    { xOffset: 0, yOffset: -2, rotation: -2, brightness: 1.08, saturation: 1.12, shadowScale: 0.96, shadowOpacity: 0.15 },
    { xOffset: 4, yOffset: -8, rotation: -6, brightness: 1.12, saturation: 1.15, shadowScale: 0.86, shadowOpacity: 0.12 },
    { xOffset: 2, yOffset: -5, rotation: 2, brightness: 1.1, saturation: 1.14, shadowScale: 0.91, shadowOpacity: 0.14 },
    { xOffset: -2, yOffset: -1, rotation: 5, brightness: 1.06, saturation: 1.1, shadowScale: 0.98, shadowOpacity: 0.16 },
  ],
  sleepy: [
    { xOffset: 0, yOffset: 3, rotation: 2, brightness: 0.93, saturation: 0.88, shadowScale: 1.04, shadowOpacity: 0.2 },
    { xOffset: -2, yOffset: 7, rotation: 5, brightness: 0.89, saturation: 0.8, shadowScale: 1.1, shadowOpacity: 0.22 },
    { xOffset: 1, yOffset: 5, rotation: 3, brightness: 0.9, saturation: 0.82, shadowScale: 1.08, shadowOpacity: 0.21 },
    { xOffset: 2, yOffset: 3, rotation: 1, brightness: 0.95, saturation: 0.89, shadowScale: 1.04, shadowOpacity: 0.19 },
  ],
  sick: [
    { xOffset: 0, yOffset: 4, rotation: 3, brightness: 0.87, saturation: 0.68, shadowScale: 1.05, shadowOpacity: 0.21 },
    { xOffset: -3, yOffset: 8, rotation: 6, brightness: 0.8, saturation: 0.6, shadowScale: 1.12, shadowOpacity: 0.24 },
    { xOffset: 1, yOffset: 6, rotation: 4, brightness: 0.84, saturation: 0.64, shadowScale: 1.08, shadowOpacity: 0.22 },
    { xOffset: 2, yOffset: 5, rotation: 2, brightness: 0.88, saturation: 0.7, shadowScale: 1.05, shadowOpacity: 0.21 },
  ],
};

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function getAnimatedArtifactDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function getSpeciesEntry(speciesId: number): DinoEntry {
  const entry = DINO_ENTRIES.find((dino) => dino.id === speciesId);
  if (!entry) {
    throw new Error(`Missing dino data for #${padTamagotchiId(speciesId)}`);
  }

  return entry;
}

function getSpeciesRoot(projectRoot: string, speciesId: number): string {
  return normalizePath(join(projectRoot, "public", "tamagotchi", padTamagotchiId(speciesId)));
}

function getPrototypeRoot(projectRoot: string, speciesId: number): string {
  return normalizePath(join(projectRoot, ".artifacts", "tamagotchi", padTamagotchiId(speciesId), "prototype"));
}

export function getAnimatedPrototypeAnchorOutputPath(projectRoot: string, speciesId: number, stage: Stage): string {
  return normalizePath(join(getPrototypeRoot(projectRoot, speciesId), "anchors", `${stage}-anchor.png`));
}

export function getAnimatedPrototypeExploratoryOutputPath(
  projectRoot: string,
  speciesId: number,
  stage: Stage,
  animationState: TamagotchiAnimationState
): string {
  return normalizePath(
    join(getPrototypeRoot(projectRoot, speciesId), "exploratory", `${stage}-${animationState}-exploratory.png`)
  );
}

export function getAnimatedPrototypeSpriteOutputPath(
  projectRoot: string,
  speciesId: number,
  stage: Stage,
  animationState: TamagotchiAnimationState
): string {
  return normalizePath(getTamagotchiMoodSpriteOutputPath(projectRoot, speciesId, stage, animationState));
}

export function getAnimatedPrototypeMetadataPath(projectRoot: string, speciesId: number): string {
  return normalizePath(join(getPrototypeRoot(projectRoot, speciesId), "metadata.json"));
}

export function getAnimatedBatchPromptPath(projectRoot: string, era: BatchName, artifactDate = getAnimatedArtifactDate()): string {
  return normalizePath(join(projectRoot, ".prompts", `${artifactDate}-${era}-style-lock-reset-prompts.md`));
}

export function getAnimatedBatchLogPath(projectRoot: string, era: BatchName, artifactDate = getAnimatedArtifactDate()): string {
  return normalizePath(join(projectRoot, ".logs", `${artifactDate}-${era}-style-lock-reset.md`));
}

function getRawGenerationDir(projectRoot: string, speciesId: number, stage: Stage, animationState: TamagotchiAnimationState): string {
  return normalizePath(join(getPrototypeRoot(projectRoot, speciesId), "raw", `${stage}-${animationState}`));
}

function getAnchorRawGenerationDir(projectRoot: string, speciesId: number, stage: Stage): string {
  return normalizePath(join(getPrototypeRoot(projectRoot, speciesId), "raw", `${stage}-anchor`));
}

export function getAnchorTransientPath(
  projectRoot: string,
  speciesId: number,
  stage: Stage,
  kind: "stripped"
): string {
  return normalizePath(join(getAnchorRawGenerationDir(projectRoot, speciesId, stage), `${stage}-anchor-${kind}.png`));
}

function readRawResponseImages(outputDir: string, prefix: string): string[] {
  return readdirSync(outputDir)
    .filter((fileName) => fileName.startsWith(`${prefix}-`) && /\.(png|jpg|jpeg|webp)$/i.test(fileName))
    .map((fileName) => normalizePath(join(outputDir, fileName)))
    .sort();
}

function buildAnchorStagePromptBlock(stage: Stage): string {
  return [
    `Stage target: ${stage}.`,
    "Generate a single approved-style Tamagotchi anchor still for later animation work.",
    "Requirements: side view only, feet planted, centered readable silhouette, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.",
  ].join("\n");
}

function buildStageMoodPromptBlock(stage: Stage, animationState: TamagotchiAnimationState): string {
  return [
    `Stage target: ${stage}.`,
    `Mood target: ${animationState}.`,
    "Using the approved stage anchor and the deterministic exploratory strip as references, generate a STRICT clean 4-frame horizontal pixel sprite strip.",
    "Requirements: side view only, fixed feet anchor across all 4 frames, chunky visible pixels, no anti-aliasing, no realistic shading, no painterly texture, no smooth gradients, no text, no scenery, no props, no border, no frame, no drop shadow.",
    "The loop should read clearly at tiny handheld-screen size and preserve the species silhouette identity.",
    animationState === "idle"
      ? "Idle motion: breathing, blink, small head or tail drift, alive but mostly in place."
      : animationState === "happy"
        ? "Happy motion: brighter posture, stronger head or tail accent, energetic but still planted."
        : animationState === "sleepy"
          ? "Sleepy motion: droop, slower recovery, heavier eyelids, visibly tired without collapsing."
          : "Sick motion: slouch, weaker timing, reduced lift, visibly unwell but still readable.",
  ].join("\n");
}

export function getStyleLockAnchorReferencePaths(projectRoot: string, stage: Stage): string[] {
  return STYLE_LOCK_REFERENCE_SPECIES.map((speciesId) =>
    normalizePath(getTamagotchiSpriteOutputPath(projectRoot, speciesId, stage))
  );
}

export function buildAnimatedAnchorPrompt(species: PromptSpecies, stage: Stage): string {
  return [
    buildStyleLockPromptBlock(),
    buildSpeciesPromptBlock(species),
    buildAnchorStagePromptBlock(stage),
  ].join("\n\n");
}

export function buildAnimatedFinalPrompt(
  species: PromptSpecies,
  stage: Stage,
  animationState: TamagotchiAnimationState
): string {
  return [
    buildStyleLockPromptBlock(),
    buildSpeciesPromptBlock(species),
    buildStageMoodPromptBlock(stage, animationState),
  ].join("\n\n");
}

export function buildAnimatedPrototypeMetadata(input: {
  speciesId: number;
  speciesName: string;
  era: Era;
  generatedAt: string;
  batch: BatchName;
}): AnimatedPrototypeMetadata {
  return {
    ...buildPendingAnimatedApprovalMetadata(),
    speciesId: input.speciesId,
    speciesName: input.speciesName,
    era: input.era,
    generatedAt: input.generatedAt,
    sourceMode: "direct-gemini-api",
    model: GEMINI_MODEL,
    batch: input.batch,
    anchors: [],
    exploratory: [],
    finalStrips: [],
    resetWorkflow: {
      mode: STYLE_LOCK_RESET_MODE,
      anchorSourceMode: "fresh-gemini",
      anchorReferenceSpecies: [...STYLE_LOCK_REFERENCE_SPECIES],
      anchorNormalization: "stage-normalized",
    },
  };
}

function toProjectRelativePath(projectRoot: string, targetPath: string): string {
  const normalizedProjectRoot = normalizePath(projectRoot);
  const normalizedTargetPath = normalizePath(targetPath);

  if (normalizedTargetPath.startsWith(`${normalizedProjectRoot}/`)) {
    return normalizedTargetPath.slice(normalizedProjectRoot.length + 1);
  }

  return normalizedTargetPath;
}

export function ensureStyleLockReferencePathsExist(
  referencePaths: string[],
  exists: (path: string) => boolean = existsSync
): void {
  for (const referencePath of referencePaths) {
    if (!exists(referencePath)) {
      throw new Error(`Missing style-lock reference sprite: ${referencePath}`);
    }
  }
}

export function buildAnimatedBatchPromptArtifact(era: BatchName, speciesIds: number[]): string {
  const defaultResetTargets = STYLE_LOCK_RESET_BATCHES[era];
  const sections = speciesIds.map((speciesId) => {
    const species = getSpeciesEntry(speciesId);
    return [
      `## #${padTamagotchiId(speciesId)} ${species.name}`,
      "",
      "Reset workflow:",
      "- Use the approved #001 and #002 stage sprites as the only style-lock references.",
      "- Generate a fresh Gemini anchor still for each target stage before any exploratory strip work.",
      "- Strip white and normalize the fresh anchor onto the target stage canvas.",
      "- Generate deterministic exploratory strips locally from the normalized anchor.",
      "- Generate final prototype strips with Gemini using the normalized anchor plus exploratory strip as references.",
      "",
      "Anchor prompt template:",
      "```text",
      buildAnimatedAnchorPrompt(species, "adult"),
      "```",
      "",
      "Final prompt template:",
      "```text",
      buildAnimatedFinalPrompt(species, "adult", "happy"),
      "```",
      "",
    ].join("\n");
  });

  return [
    `# ${era[0].toUpperCase()} Style-Lock Reset Prompts`,
    "",
    "Related plan: `Remaining Tamagotchi Animated Sprite Rollout`",
    "",
    "## Workflow",
    "",
    `Intended command contract: \`bun run scripts/tamagotchi-animated-rollout.ts --mode style-lock-reset --era ${era}\``,
    "",
    `Default reset targets for \`--era ${era}\`: ${defaultResetTargets.map((id) => `\`#${padTamagotchiId(id)}\``).join(", ")}`,
    "",
    "1. Use the approved #001 and #002 stage sprites as the style-lock references.",
    "2. Generate fresh stage anchors through Nano Banana 2 / Gemini for the reset species only.",
    "3. Strip white, then normalize each fresh anchor onto its target stage canvas before it becomes a reference.",
    "4. Generate deterministic exploratory strips locally for each mood from those normalized anchors.",
    "5. Generate final 4-frame prototype strips through Nano Banana 2 / Gemini.",
    "6. Remove the pure white background deterministically and repair detached frame islands before review.",
    "",
    ...sections,
  ].join("\n");
}

async function readRawBuffer(path: string): Promise<RawBufferInfo> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function getLargestConnectedComponent(rawBuffer: RawBufferInfo): number[] {
  const { data, width, height } = rawBuffer;
  const visited = new Uint8Array(width * height);
  let largest: number[] = [];

  const enqueue = (x: number, y: number, queue: number[]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const pixelIndex = (y * width) + x;
    if (visited[pixelIndex]) {
      return;
    }

    if (data[(pixelIndex * 4) + 3] <= SOURCE_ALPHA_THRESHOLD) {
      return;
    }

    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = (y * width) + x;
      if (visited[start] || data[(start * 4) + 3] <= SOURCE_ALPHA_THRESHOLD) {
        continue;
      }

      visited[start] = 1;
      const queue = [start];
      const component: number[] = [];

      while (queue.length > 0) {
        const current = queue.pop();
        if (current === undefined) {
          continue;
        }

        component.push(current);
        const currentX = current % width;
        const currentY = Math.floor(current / width);

        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ]) {
          enqueue(currentX + dx, currentY + dy, queue);
        }
      }

      if (component.length > largest.length) {
        largest = component;
      }
    }
  }

  if (largest.length === 0) {
    throw new Error("No visible pixels found in anchor source.");
  }

  return largest;
}

async function extractPrimarySubject(path: string): Promise<Buffer> {
  const rawBuffer = await readRawBuffer(path);
  const component = getLargestConnectedComponent(rawBuffer);
  const { data, width, height } = rawBuffer;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (const pixel of component) {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const croppedWidth = (maxX - minX) + 1;
  const croppedHeight = (maxY - minY) + 1;
  const masked = Buffer.alloc(croppedWidth * croppedHeight * 4);

  for (const pixel of component) {
    const sourceX = pixel % width;
    const sourceY = Math.floor(pixel / width);
    const targetIndex = (((sourceY - minY) * croppedWidth) + (sourceX - minX)) * 4;
    const sourceIndex = pixel * 4;

    masked[targetIndex] = data[sourceIndex];
    masked[targetIndex + 1] = data[sourceIndex + 1];
    masked[targetIndex + 2] = data[sourceIndex + 2];
    masked[targetIndex + 3] = data[sourceIndex + 3];
  }

  return sharp(masked, {
    raw: {
      width: croppedWidth,
      height: croppedHeight,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function buildShadowOverlay(centerX: number, baselineY: number, pose: Pose, stage: Stage): Buffer {
  const shadowWidth = stage === "adult" ? 42 : stage === "juvenile" ? 36 : 30;
  const shadowHeight = stage === "adult" ? 8 : 7;
  const shadowSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" shape-rendering="crispEdges">`,
    `<ellipse cx="${centerX}" cy="${baselineY + 10}" rx="${Math.max(12, Math.round(shadowWidth * pose.shadowScale))}" ry="${Math.max(4, Math.round(shadowHeight * pose.shadowScale))}" fill="#6f4e2a" opacity="${pose.shadowOpacity}" />`,
    "</svg>",
  ].join("");

  return Buffer.from(shadowSvg, "utf-8");
}

async function renderExploratoryFrame(subjectBuffer: Buffer, stage: Stage, pose: Pose): Promise<Buffer> {
  const stageConfig = STAGE_NORMALIZATION[stage];
  const rendered = await sharp(subjectBuffer)
    .resize(stageConfig.targetBox, stageConfig.targetBox, {
      fit: "inside",
      kernel: sharp.kernel.nearest,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .modulate({
      brightness: pose.brightness,
      saturation: pose.saturation,
    })
    .rotate(pose.rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const metadata = await sharp(rendered).metadata();
  const renderedWidth = metadata.width ?? stageConfig.targetBox;
  const renderedHeight = metadata.height ?? stageConfig.targetBox;

  return sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: buildShadowOverlay(stageConfig.centerX + Math.round(pose.xOffset / 2), stageConfig.baselineY, pose, stage),
        left: 0,
        top: 0,
      },
      {
        input: rendered,
        left: Math.round(stageConfig.centerX - (renderedWidth / 2) + pose.xOffset),
        top: Math.round(stageConfig.baselineY - renderedHeight + pose.yOffset),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function writeExploratoryStrip(anchorSourcePath: string, speciesId: number, stage: Stage, animationState: TamagotchiAnimationState): Promise<string> {
  const subjectBuffer = await extractPrimarySubject(anchorSourcePath);
  const frames = await Promise.all(
    EXPLORATORY_POSES[animationState].map((pose) => renderExploratoryFrame(subjectBuffer, stage, pose))
  );
  const composites = frames.map((frame, index) => ({
    input: frame,
    left: index * 256,
    top: 0,
  }));
  const outputPath = getAnimatedPrototypeExploratoryOutputPath(PROJECT_ROOT, speciesId, stage, animationState);
  ensureDir(dirname(outputPath));
  const buffer = await sharp({
    create: {
      width: 256 * FRAME_COUNT,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

async function stripNearWhiteBackground(inputPath: string, outputPath: string): Promise<void> {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const stripped = stripEdgeConnectedNearWhiteBackground(data, info.width, info.height, info.channels);
  await sharp(stripped, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function repairStrip(path: string): Promise<void> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height || info.width % FRAME_COUNT !== 0) {
    throw new Error(`Unexpected strip dimensions for ${path}: ${info.width}x${info.height}`);
  }

  const frameWidth = info.width / FRAME_COUNT;
  const output = Buffer.alloc(data.length, 0);
  const alphaAt = (x: number, y: number, startX: number) => data[((y * info.width) + (startX + x)) * 4 + 3];

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const startX = frame * frameWidth;
    const visited = new Uint8Array(frameWidth * info.height);
    let largest: number[] = [];

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        const index = (y * frameWidth) + x;
        if (visited[index] || alphaAt(x, y, startX) === 0) {
          continue;
        }

        const queue = [index];
        const component: number[] = [];
        visited[index] = 1;

        while (queue.length > 0) {
          const current = queue.pop();
          if (current === undefined) {
            continue;
          }

          component.push(current);
          const currentX = current % frameWidth;
          const currentY = Math.floor(current / frameWidth);

          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ]) {
            const nextX = currentX + dx;
            const nextY = currentY + dy;
            if (nextX < 0 || nextY < 0 || nextX >= frameWidth || nextY >= info.height) {
              continue;
            }

            const nextIndex = (nextY * frameWidth) + nextX;
            if (visited[nextIndex] || alphaAt(nextX, nextY, startX) === 0) {
              continue;
            }

            visited[nextIndex] = 1;
            queue.push(nextIndex);
          }
        }

        if (component.length > largest.length) {
          largest = component;
        }
      }
    }

    const keep = new Set(largest);
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        const localIndex = (y * frameWidth) + x;
        if (!keep.has(localIndex)) {
          continue;
        }

        const sourceIndex = ((y * info.width) + (startX + x)) * 4;
        output[sourceIndex] = data[sourceIndex];
        output[sourceIndex + 1] = data[sourceIndex + 1];
        output[sourceIndex + 2] = data[sourceIndex + 2];
        output[sourceIndex + 3] = data[sourceIndex + 3];
      }
    }
  }

  await sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(path);
}

async function runGeminiImage(
  prompt: string,
  outputDir: string,
  prefix: string,
  inputImages: string[],
  options: GeminiImageOptions = {}
): Promise<string> {
  ensureDir(outputDir);

  const args = [
    GEMINI_HELPER,
    "--prompt",
    prompt,
    "--aspect-ratio",
    options.aspectRatio ?? "4:1",
    "--image-size",
    options.imageSize ?? "1K",
    "--output-dir",
    outputDir,
    "--prefix",
    prefix,
  ];

  for (const inputImage of inputImages) {
    args.push("--input-image", inputImage);
  }

  const result = await new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve, reject) => {
    const child = spawn("python", args, {
      cwd: PROJECT_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ stdout, stderr, exitCode }));
  });

  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `Gemini helper exited with ${result.exitCode}`);
  }

  const imagePaths = readRawResponseImages(outputDir, prefix);
  if (imagePaths.length === 0) {
    throw new Error(`Gemini helper returned no images for ${prefix}`);
  }

  return imagePaths[0];
}

async function renderNormalizedAnchorFrame(subjectBuffer: Buffer, stage: Stage): Promise<Buffer> {
  return renderExploratoryFrame(subjectBuffer, stage, {
    xOffset: 0,
    yOffset: 0,
    rotation: 0,
    brightness: 1,
    saturation: 1,
    shadowScale: 1,
    shadowOpacity: 0,
  });
}

export async function normalizeGeneratedAnchor(inputPath: string, outputPath: string, stage: Stage): Promise<void> {
  const subjectBuffer = await extractPrimarySubject(inputPath);
  const normalizedAnchor = await renderNormalizedAnchorFrame(subjectBuffer, stage);
  ensureDir(dirname(outputPath));
  await sharp(normalizedAnchor)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

export async function prepareGeneratedAnchorForReuse(inputPath: string, outputPath: string, stage: Stage): Promise<void> {
  const normalizedOutputPath = normalizePath(outputPath);
  const speciesMatch = normalizedOutputPath.match(/\/\.artifacts\/tamagotchi\/(\d{3})\/prototype\/anchors\/[a-z]+-anchor\.png$/);
  if (!speciesMatch) {
    throw new Error(`Unexpected anchor output path: ${outputPath}`);
  }

  const projectRoot = normalizedOutputPath.slice(0, normalizedOutputPath.indexOf("/.artifacts/tamagotchi/"));
  const speciesId = Number.parseInt(speciesMatch[1], 10);
  const strippedAnchorPath = getAnchorTransientPath(projectRoot, speciesId, stage, "stripped");
  ensureDir(dirname(strippedAnchorPath));
  await stripNearWhiteBackground(inputPath, strippedAnchorPath);
  await normalizeGeneratedAnchor(strippedAnchorPath, outputPath, stage);
}

function buildPendingAnimatedApprovalMetadata(): AnimatedApprovalMetadata {
  return {
    animationApproved: false,
  };
}

async function generateFreshApprovedAnchor(speciesId: number, stage: Stage): Promise<string> {
  const species = getSpeciesEntry(speciesId);
  const referencePaths = getStyleLockAnchorReferencePaths(PROJECT_ROOT, stage);
  ensureStyleLockReferencePathsExist(referencePaths);

  const rawOutputDir = getAnchorRawGenerationDir(PROJECT_ROOT, speciesId, stage);
  rmSync(rawOutputDir, { recursive: true, force: true });
  ensureDir(rawOutputDir);

  const rawImagePath = await runGeminiImage(
    buildAnimatedAnchorPrompt(species, stage),
    rawOutputDir,
    `${stage}-anchor`,
    referencePaths,
    { aspectRatio: "1:1" }
  );

  const outputPath = getAnimatedPrototypeAnchorOutputPath(PROJECT_ROOT, speciesId, stage);
  await prepareGeneratedAnchorForReuse(rawImagePath, outputPath, stage);
  return outputPath;
}

async function generateSpeciesBatch(speciesId: number, batch: BatchName): Promise<AnimatedPrototypeMetadata> {
  const species = getSpeciesEntry(speciesId);
  const metadata = buildAnimatedPrototypeMetadata({
    speciesId,
    speciesName: species.name,
    era: species.era,
    generatedAt: new Date().toISOString(),
    batch,
  });

  for (const stage of TAMAGOTCHI_ANIMATION_STAGES) {
    const anchorPath = await generateFreshApprovedAnchor(speciesId, stage);
    metadata.anchors.push(toProjectRelativePath(PROJECT_ROOT, anchorPath));

    for (const animationState of TAMAGOTCHI_ANIMATION_STATES) {
      const exploratoryPath = await writeExploratoryStrip(anchorPath, speciesId, stage, animationState);
      metadata.exploratory.push(toProjectRelativePath(PROJECT_ROOT, exploratoryPath));

      const rawOutputDir = getRawGenerationDir(PROJECT_ROOT, speciesId, stage, animationState);
      rmSync(rawOutputDir, { recursive: true, force: true });
      ensureDir(rawOutputDir);

      const prompt = buildAnimatedFinalPrompt(species, stage, animationState);
      const rawImagePath = await runGeminiImage(
        prompt,
        rawOutputDir,
        `${stage}-${animationState}`,
        [anchorPath, exploratoryPath]
      );

      const finalOutputPath = getAnimatedPrototypeSpriteOutputPath(PROJECT_ROOT, speciesId, stage, animationState);
      ensureDir(dirname(finalOutputPath));
      await stripNearWhiteBackground(rawImagePath, finalOutputPath);
      await repairStrip(finalOutputPath);
      metadata.finalStrips.push(toProjectRelativePath(PROJECT_ROOT, finalOutputPath));
    }
  }

  const metadataPath = getAnimatedPrototypeMetadataPath(PROJECT_ROOT, speciesId);
  ensureDir(dirname(metadataPath));
  await fs.writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf-8");
  return metadata;
}

export function parseAnimatedRolloutArgs(args: string[]): RolloutParseResult {
  const modeIndex = args.indexOf("--mode");
  const eraIndex = args.indexOf("--era");
  const speciesIndex = args.indexOf("--species");
  const modeArg = modeIndex >= 0 ? args[modeIndex + 1] : undefined;
  const eraArg = (eraIndex >= 0 ? args[eraIndex + 1] : "triassic") as BatchName;

  if (modeArg === undefined) {
    throw new Error(`Expected --mode ${STYLE_LOCK_RESET_MODE} for this rollout.`);
  }

  if (modeArg !== STYLE_LOCK_RESET_MODE) {
    throw new Error(`Unsupported rollout mode: ${modeArg}`);
  }

  if (!(eraArg in TAMAGOTCHI_ANIMATED_BATCHES)) {
    throw new Error(`Unsupported era batch: ${eraArg}`);
  }

  if (speciesIndex >= 0) {
    const speciesIds = (args[speciesIndex + 1] ?? "")
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));
    if (speciesIds.length === 0) {
      throw new Error("Expected a comma-separated species list after --species");
    }

    return { mode: STYLE_LOCK_RESET_MODE, batch: eraArg, speciesIds };
  }

  return { mode: STYLE_LOCK_RESET_MODE, batch: eraArg, speciesIds: [...STYLE_LOCK_RESET_BATCHES[eraArg]] };
}

export function buildAnimatedBatchLogArtifact(
  batch: BatchName,
  artifactDate: string,
  speciesMetadata: AnimatedPrototypeMetadata[]
): string {
  const speciesIds = speciesMetadata.map((entry) => entry.speciesId);
  const defaultResetTargets = STYLE_LOCK_RESET_BATCHES[batch];

  return [
    `# ${artifactDate} ${batch} Tamagotchi style-lock reset`,
    "",
    "Related issue: `RIO-40`",
    "",
    "## Scope",
    "",
    `Task 2 refactors the rollout pipeline for the full-reset pass so species ${speciesIds.map((id) => `#${padTamagotchiId(id)}`).join(", ")} regenerate fresh anchors under the approved #001-#002 style-lock family instead of copying shipped stage sprites.`,
    "",
    "## Decisions",
    "",
    `- The rollout CLI now requires \`--mode style-lock-reset\`; the default ${batch} reset target set is \`#${padTamagotchiId(defaultResetTargets[0])}-#${padTamagotchiId(defaultResetTargets[defaultResetTargets.length - 1])}\`, so an unqualified ${batch} reset cannot include reference species \`#002\`.`,
    `- Renamed rollout artifact helpers to the reset-specific prompt/log filenames while keeping helper date output injectable for tests instead of hardcoding the wall-clock date.`,
    "- Replaced static-anchor copying in `scripts/tamagotchi-animated-rollout.ts` with fresh Gemini anchor generation using the #001 and #002 stage sprites as references.",
    "- Fresh Gemini anchors are now white-stripped and stage-normalized onto the target 256x256 stage canvas before they become references for exploratory or final generation.",
    "- Split prompt construction into style-lock, species, and stage-or-stage+mood blocks to keep anchor prompts and final strip prompts aligned.",
    "- Prototype metadata now uses a clearer composed contract: shared approval fields plus a nested `resetWorkflow` block describing mode, reference species, and anchor normalization.",
    "- Batch artifact text now describes the reset workflow rather than the older copy-anchor rollout.",
    "",
    "## Verification plan",
    "",
    "- Run the focused Bun rollout helper test file, including control-flow and image-normalization branches.",
    "- Run the related style-lock test file to confirm the shared approval metadata contract remains aligned with manifest gating.",
    "",
    "## Notes",
    "",
    "- No assets were regenerated in this task.",
    "- No runtime files were changed in this task.",
  ].join("\n");
}

async function writeBatchArtifacts(batch: BatchName, speciesMetadata: AnimatedPrototypeMetadata[]): Promise<void> {
  const artifactDate = getAnimatedArtifactDate();
  const promptPath = getAnimatedBatchPromptPath(PROJECT_ROOT, batch, artifactDate);
  const logPath = getAnimatedBatchLogPath(PROJECT_ROOT, batch, artifactDate);

  ensureDir(dirname(promptPath));
  ensureDir(dirname(logPath));

  writeFileSync(promptPath, `${buildAnimatedBatchPromptArtifact(batch, speciesMetadata.map((entry) => entry.speciesId))}\n`, "utf-8");
  writeFileSync(logPath, `${buildAnimatedBatchLogArtifact(batch, artifactDate, speciesMetadata)}\n`, "utf-8");
}

export async function runAnimatedRollout(projectRoot = PROJECT_ROOT, args = process.argv.slice(2)): Promise<void> {
  if (projectRoot !== PROJECT_ROOT) {
    throw new Error("Custom project roots are not supported for this rollout script.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const { batch, speciesIds } = parseAnimatedRolloutArgs(args);
  const speciesMetadata: AnimatedPrototypeMetadata[] = [];

  for (const speciesId of speciesIds) {
    console.log(`Generating animated Tamagotchi strips for #${padTamagotchiId(speciesId)} ${getSpeciesEntry(speciesId).name}`);
    speciesMetadata.push(await generateSpeciesBatch(speciesId, batch));
  }

  writeTamagotchiManifest(PROJECT_ROOT);
  await writeBatchArtifacts(batch, speciesMetadata);
}

if (import.meta.main) {
  runAnimatedRollout().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
