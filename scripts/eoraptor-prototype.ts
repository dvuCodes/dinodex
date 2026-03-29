import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import type { Stage } from "../src/lib/types";
import type { TamagotchiAnimationState } from "../src/lib/tamagotchi";

export const EORAPTOR_PROTOTYPE_ID = 1;
export const EORAPTOR_FRAME_SIZE = 256;
export const EORAPTOR_STRIP_FRAME_COUNT = 4;
export const EORAPTOR_PROTOTYPE_STAGES: Stage[] = ["hatchling", "juvenile", "adult"];
export const EORAPTOR_PROTOTYPE_ANIMATION_STATES: TamagotchiAnimationState[] = [
  "idle",
  "happy",
  "sleepy",
  "sick",
];

type BlinkState = "open" | "half" | "closed";
type VariantKind = "final" | "exploratory";

interface StageNormalization {
  targetBox: number;
  centerX: number;
  baselineY: number;
  eyeX: number;
  eyeY: number;
}

export interface EoraptorPrototypePose {
  xOffset: number;
  yOffset: number;
  rotation: number;
  brightness: number;
  saturation: number;
  blink: BlinkState;
  shadowScale: number;
  shadowOpacity: number;
}

interface PrimarySubject {
  buffer: Buffer;
  width: number;
  height: number;
}

interface RawBufferInfo {
  data: Buffer<ArrayBufferLike>;
  width: number;
  height: number;
}

interface OutputPlan {
  anchors: string[];
  exploratory: string[];
  finalStrips: string[];
  metadataPath: string;
}

const PROJECT_ROOT = join(import.meta.dirname, "..");
const EORAPTOR_ROOT = join(PROJECT_ROOT, "public", "tamagotchi", "001");
const SOURCE_ALPHA_THRESHOLD = 8;
const SHADOW_FILL = "#6f4e2a";

export const EORAPTOR_STAGE_NORMALIZATION: Record<Stage, StageNormalization> = {
  hatchling: {
    targetBox: 168,
    centerX: 120,
    baselineY: 212,
    eyeX: 133,
    eyeY: 84,
  },
  juvenile: {
    targetBox: 196,
    centerX: 129,
    baselineY: 216,
    eyeX: 73,
    eyeY: 84,
  },
  adult: {
    targetBox: 208,
    centerX: 128,
    baselineY: 220,
    eyeX: 58,
    eyeY: 55,
  },
};

const FINAL_POSES: Record<TamagotchiAnimationState, EoraptorPrototypePose[]> = {
  idle: [
    { xOffset: 0, yOffset: 0, rotation: 0, brightness: 1, saturation: 1, blink: "open", shadowScale: 1, shadowOpacity: 0.18 },
    { xOffset: 1, yOffset: -2, rotation: -1.1, brightness: 1.02, saturation: 1.02, blink: "open", shadowScale: 0.96, shadowOpacity: 0.16 },
    { xOffset: 0, yOffset: -1, rotation: 0.35, brightness: 1, saturation: 1, blink: "closed", shadowScale: 0.97, shadowOpacity: 0.16 },
    { xOffset: -1, yOffset: 1, rotation: 1.1, brightness: 0.99, saturation: 0.98, blink: "open", shadowScale: 1.02, shadowOpacity: 0.19 },
  ],
  happy: [
    { xOffset: 0, yOffset: -1, rotation: -1.5, brightness: 1.05, saturation: 1.08, blink: "open", shadowScale: 0.98, shadowOpacity: 0.16 },
    { xOffset: 2, yOffset: -5, rotation: -3.2, brightness: 1.08, saturation: 1.1, blink: "open", shadowScale: 0.92, shadowOpacity: 0.14 },
    { xOffset: 1, yOffset: -3, rotation: -0.6, brightness: 1.07, saturation: 1.12, blink: "open", shadowScale: 0.95, shadowOpacity: 0.15 },
    { xOffset: -1, yOffset: -1, rotation: 1.4, brightness: 1.04, saturation: 1.05, blink: "half", shadowScale: 0.99, shadowOpacity: 0.17 },
  ],
  sleepy: [
    { xOffset: 0, yOffset: 2, rotation: 1.6, brightness: 0.94, saturation: 0.9, blink: "half", shadowScale: 1.03, shadowOpacity: 0.19 },
    { xOffset: -1, yOffset: 4, rotation: 2.7, brightness: 0.91, saturation: 0.86, blink: "closed", shadowScale: 1.07, shadowOpacity: 0.21 },
    { xOffset: 0, yOffset: 3, rotation: 1.8, brightness: 0.92, saturation: 0.86, blink: "closed", shadowScale: 1.06, shadowOpacity: 0.2 },
    { xOffset: 1, yOffset: 2, rotation: 0.8, brightness: 0.95, saturation: 0.9, blink: "half", shadowScale: 1.03, shadowOpacity: 0.19 },
  ],
  sick: [
    { xOffset: 0, yOffset: 4, rotation: 2.4, brightness: 0.88, saturation: 0.72, blink: "half", shadowScale: 1.04, shadowOpacity: 0.2 },
    { xOffset: -1, yOffset: 5, rotation: 3.2, brightness: 0.84, saturation: 0.68, blink: "closed", shadowScale: 1.07, shadowOpacity: 0.22 },
    { xOffset: 0, yOffset: 4, rotation: 2.8, brightness: 0.86, saturation: 0.7, blink: "half", shadowScale: 1.06, shadowOpacity: 0.21 },
    { xOffset: 1, yOffset: 4, rotation: 2.1, brightness: 0.88, saturation: 0.72, blink: "half", shadowScale: 1.04, shadowOpacity: 0.2 },
  ],
};

const EXPLORATORY_POSES: Record<TamagotchiAnimationState, EoraptorPrototypePose[]> = {
  idle: [
    { xOffset: 0, yOffset: 0, rotation: 0, brightness: 1, saturation: 1, blink: "open", shadowScale: 1, shadowOpacity: 0.18 },
    { xOffset: 3, yOffset: -4, rotation: -4, brightness: 1.03, saturation: 1.03, blink: "open", shadowScale: 0.9, shadowOpacity: 0.14 },
    { xOffset: 0, yOffset: -2, rotation: 0, brightness: 1, saturation: 1, blink: "closed", shadowScale: 0.95, shadowOpacity: 0.15 },
    { xOffset: -3, yOffset: 1, rotation: 3.8, brightness: 0.98, saturation: 0.98, blink: "open", shadowScale: 1.03, shadowOpacity: 0.19 },
  ],
  happy: [
    { xOffset: 0, yOffset: -2, rotation: -2, brightness: 1.08, saturation: 1.12, blink: "open", shadowScale: 0.96, shadowOpacity: 0.15 },
    { xOffset: 4, yOffset: -8, rotation: -6, brightness: 1.12, saturation: 1.15, blink: "open", shadowScale: 0.86, shadowOpacity: 0.12 },
    { xOffset: 2, yOffset: -5, rotation: 2, brightness: 1.1, saturation: 1.14, blink: "open", shadowScale: 0.91, shadowOpacity: 0.14 },
    { xOffset: -2, yOffset: -1, rotation: 5, brightness: 1.06, saturation: 1.1, blink: "half", shadowScale: 0.98, shadowOpacity: 0.16 },
  ],
  sleepy: [
    { xOffset: 0, yOffset: 3, rotation: 2, brightness: 0.93, saturation: 0.88, blink: "half", shadowScale: 1.04, shadowOpacity: 0.2 },
    { xOffset: -2, yOffset: 7, rotation: 5, brightness: 0.89, saturation: 0.8, blink: "closed", shadowScale: 1.1, shadowOpacity: 0.22 },
    { xOffset: 1, yOffset: 5, rotation: 3, brightness: 0.9, saturation: 0.82, blink: "closed", shadowScale: 1.08, shadowOpacity: 0.21 },
    { xOffset: 2, yOffset: 3, rotation: 1, brightness: 0.95, saturation: 0.89, blink: "half", shadowScale: 1.04, shadowOpacity: 0.19 },
  ],
  sick: [
    { xOffset: 0, yOffset: 4, rotation: 3, brightness: 0.87, saturation: 0.68, blink: "half", shadowScale: 1.05, shadowOpacity: 0.21 },
    { xOffset: -3, yOffset: 8, rotation: 6, brightness: 0.8, saturation: 0.6, blink: "closed", shadowScale: 1.12, shadowOpacity: 0.24 },
    { xOffset: 1, yOffset: 6, rotation: 4, brightness: 0.84, saturation: 0.64, blink: "half", shadowScale: 1.08, shadowOpacity: 0.22 },
    { xOffset: 2, yOffset: 5, rotation: 2, brightness: 0.88, saturation: 0.7, blink: "half", shadowScale: 1.05, shadowOpacity: 0.21 },
  ],
};

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function buildFrameBasePath(projectRoot: string): string {
  return normalizePath(join(projectRoot, "public", "tamagotchi", "001"));
}

export function getEoraptorPrototypeSourcePath(projectRoot: string, stage: Stage): string {
  return normalizePath(join(buildFrameBasePath(projectRoot), `${stage}.png`));
}

export function getEoraptorPrototypeSpriteOutputPath(
  projectRoot: string,
  stage: Stage,
  animationState: TamagotchiAnimationState
): string {
  return normalizePath(join(buildFrameBasePath(projectRoot), `${stage}-${animationState}.png`));
}

export function getEoraptorPrototypeSpriteUrl(stage: Stage, animationState: TamagotchiAnimationState): string {
  return `/tamagotchi/001/${stage}-${animationState}.png`;
}

export function getEoraptorPrototypeAnchorOutputPath(projectRoot: string, stage: Stage): string {
  return normalizePath(join(buildFrameBasePath(projectRoot), "prototype", "anchors", `${stage}-anchor.png`));
}

export function getEoraptorPrototypeExploratoryOutputPath(
  projectRoot: string,
  stage: Stage,
  animationState: TamagotchiAnimationState
): string {
  return normalizePath(
    join(buildFrameBasePath(projectRoot), "prototype", "exploratory", `${stage}-${animationState}-exploratory.png`)
  );
}

export function getEoraptorPrototypeMetadataPath(projectRoot: string): string {
  return normalizePath(join(buildFrameBasePath(projectRoot), "prototype", "metadata.json"));
}

export function getEoraptorPrototypePoses(
  animationState: TamagotchiAnimationState,
  variant: VariantKind = "final"
): EoraptorPrototypePose[] {
  return [...(variant === "exploratory" ? EXPLORATORY_POSES[animationState] : FINAL_POSES[animationState])];
}

export function buildEoraptorPrototypeOutputPlan(projectRoot: string): OutputPlan {
  const anchors = EORAPTOR_PROTOTYPE_STAGES.map((stage) => getEoraptorPrototypeAnchorOutputPath(projectRoot, stage));
  const exploratory = EORAPTOR_PROTOTYPE_STAGES.flatMap((stage) =>
    EORAPTOR_PROTOTYPE_ANIMATION_STATES.map((animationState) =>
      getEoraptorPrototypeExploratoryOutputPath(projectRoot, stage, animationState)
    )
  );
  const finalStrips = EORAPTOR_PROTOTYPE_STAGES.flatMap((stage) =>
    EORAPTOR_PROTOTYPE_ANIMATION_STATES.map((animationState) =>
      getEoraptorPrototypeSpriteOutputPath(projectRoot, stage, animationState)
    )
  );

  return {
    anchors,
    exploratory,
    finalStrips,
    metadataPath: getEoraptorPrototypeMetadataPath(projectRoot),
  };
}

async function readRawBuffer(path: string): Promise<RawBufferInfo> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function getLargestConnectedComponent(rawBuffer: RawBufferInfo): number[] {
  const { data, width, height } = rawBuffer;
  const visited = new Uint8Array(width * height);
  let largest: number[] = [];

  const pushIfOpaque = (x: number, y: number, queue: number[]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const index = (y * width) + x;
    if (visited[index]) {
      return;
    }

    if (data[(index * 4) + 3] <= SOURCE_ALPHA_THRESHOLD) {
      return;
    }

    visited[index] = 1;
    queue.push(index);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = (y * width) + x;
      if (visited[start] || data[(start * 4) + 3] <= SOURCE_ALPHA_THRESHOLD) {
        continue;
      }

      visited[start] = 1;
      const queue = [start];
      const component: number[] = [];

      while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined) {
          continue;
        }

        component.push(current);
        const currentX = current % width;
        const currentY = Math.floor(current / width);

        pushIfOpaque(currentX - 1, currentY, queue);
        pushIfOpaque(currentX + 1, currentY, queue);
        pushIfOpaque(currentX, currentY - 1, queue);
        pushIfOpaque(currentX, currentY + 1, queue);
        pushIfOpaque(currentX - 1, currentY - 1, queue);
        pushIfOpaque(currentX + 1, currentY - 1, queue);
        pushIfOpaque(currentX - 1, currentY + 1, queue);
        pushIfOpaque(currentX + 1, currentY + 1, queue);
      }

      if (component.length > largest.length) {
        largest = component;
      }
    }
  }

  if (largest.length === 0) {
    throw new Error("No visible pixels found in Eoraptor source sprite.");
  }

  return largest;
}

async function extractPrimarySubject(path: string): Promise<PrimarySubject> {
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

  const buffer = await sharp(masked, {
    raw: {
      width: croppedWidth,
      height: croppedHeight,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    buffer,
    width: croppedWidth,
    height: croppedHeight,
  };
}

function buildShadowOverlay(centerX: number, baselineY: number, pose: EoraptorPrototypePose, stage: Stage): Buffer {
  const shadowWidth = stage === "adult" ? 42 : stage === "juvenile" ? 36 : 30;
  const shadowHeight = stage === "adult" ? 8 : 7;
  const rx = Math.max(12, Math.round(shadowWidth * pose.shadowScale));
  const ry = Math.max(4, Math.round(shadowHeight * pose.shadowScale));
  const shadowSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${EORAPTOR_FRAME_SIZE}" height="${EORAPTOR_FRAME_SIZE}" viewBox="0 0 ${EORAPTOR_FRAME_SIZE} ${EORAPTOR_FRAME_SIZE}" shape-rendering="crispEdges">`,
    `<ellipse cx="${centerX}" cy="${baselineY + 10}" rx="${rx}" ry="${ry}" fill="${SHADOW_FILL}" opacity="${pose.shadowOpacity}" />`,
    `</svg>`,
  ].join("");

  return Buffer.from(shadowSvg);
}

function buildBlinkOverlay(
  stage: Stage,
  pose: EoraptorPrototypePose,
  blink: BlinkState
): Buffer | null {
  void stage;
  void pose;
  void blink;
  return null;
}

async function renderPoseFrame(
  subject: PrimarySubject,
  stage: Stage,
  pose: EoraptorPrototypePose
): Promise<Buffer> {
  const stageConfig = EORAPTOR_STAGE_NORMALIZATION[stage];
  const subjectBuffer = await sharp(subject.buffer)
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

  const metadata = await sharp(subjectBuffer).metadata();
  const renderedWidth = metadata.width ?? stageConfig.targetBox;
  const renderedHeight = metadata.height ?? stageConfig.targetBox;
  const left = Math.round(stageConfig.centerX - (renderedWidth / 2) + pose.xOffset);
  const top = Math.round(stageConfig.baselineY - renderedHeight + pose.yOffset);
  const composites: sharp.OverlayOptions[] = [
    {
      input: buildShadowOverlay(stageConfig.centerX + Math.round(pose.xOffset / 2), stageConfig.baselineY, pose, stage),
      top: 0,
      left: 0,
    },
    {
      input: subjectBuffer,
      left,
      top,
    },
  ];

  const blinkOverlay = buildBlinkOverlay(stage, pose, pose.blink);
  if (blinkOverlay) {
    composites.push({
      input: blinkOverlay,
      left: 0,
      top: 0,
    });
  }

  return sharp({
    create: {
      width: EORAPTOR_FRAME_SIZE,
      height: EORAPTOR_FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function renderPoseStrip(
  subject: PrimarySubject,
  stage: Stage,
  poses: EoraptorPrototypePose[]
): Promise<Buffer> {
  const frames = await Promise.all(poses.map((pose) => renderPoseFrame(subject, stage, pose)));
  const composites = frames.map((frame, index) => ({
    input: frame,
    top: 0,
    left: index * EORAPTOR_FRAME_SIZE,
  }));

  return sharp({
    create: {
      width: EORAPTOR_FRAME_SIZE * EORAPTOR_STRIP_FRAME_COUNT,
      height: EORAPTOR_FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function writeOutput(path: string, buffer: Buffer) {
  ensureDir(dirname(path));
  writeFileSync(path, buffer);
}

async function writeStagePrototypeAssets(projectRoot: string, stage: Stage) {
  const sourcePath = getEoraptorPrototypeSourcePath(projectRoot, stage);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing Eoraptor source sprite: ${sourcePath}`);
  }

  const subject = await extractPrimarySubject(sourcePath);
  const anchorPose = FINAL_POSES.idle[0];
  const anchorBuffer = await renderPoseFrame(subject, stage, anchorPose);
  writeOutput(getEoraptorPrototypeAnchorOutputPath(projectRoot, stage), anchorBuffer);

  for (const animationState of EORAPTOR_PROTOTYPE_ANIMATION_STATES) {
    const exploratoryStrip = await renderPoseStrip(subject, stage, getEoraptorPrototypePoses(animationState, "exploratory"));
    writeOutput(getEoraptorPrototypeExploratoryOutputPath(projectRoot, stage, animationState), exploratoryStrip);

    const finalStrip = await renderPoseStrip(subject, stage, getEoraptorPrototypePoses(animationState, "final"));
    writeOutput(getEoraptorPrototypeSpriteOutputPath(projectRoot, stage, animationState), finalStrip);
  }
}

function writeMetadata(projectRoot: string) {
  const outputPlan = buildEoraptorPrototypeOutputPlan(projectRoot);
  const metadata = {
    speciesId: EORAPTOR_PROTOTYPE_ID,
    generatedAt: new Date().toISOString(),
    sourceMode: "deterministic-local-fallback",
    fallbackReason: {
      cli: "infsh compat 0.1.0",
      account: "guest personal team with max_concurrency 0",
      appRunStatus: 402,
      errorCode: "payment_required",
    },
    frameSize: EORAPTOR_FRAME_SIZE,
    frameCount: EORAPTOR_STRIP_FRAME_COUNT,
    stages: EORAPTOR_PROTOTYPE_STAGES,
    animationStates: EORAPTOR_PROTOTYPE_ANIMATION_STATES,
    normalization: EORAPTOR_STAGE_NORMALIZATION,
    outputs: outputPlan,
  };

  writeOutput(outputPlan.metadataPath, Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf-8"));
}

export async function generateEoraptorPrototypeAssets(projectRoot = PROJECT_ROOT) {
  for (const stage of EORAPTOR_PROTOTYPE_STAGES) {
    await writeStagePrototypeAssets(projectRoot, stage);
  }

  writeMetadata(projectRoot);
}

async function main() {
  console.log("Generating Eoraptor animated sprite prototype assets...");
  await generateEoraptorPrototypeAssets();
  console.log(`Wrote Eoraptor prototype assets -> ${normalizePath(EORAPTOR_ROOT)}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
