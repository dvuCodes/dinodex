import { existsSync, mkdirSync } from "node:fs";
import { copyFile, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import dinos from "../src/data/dinos.json";
import type { DinoEntry, Stage } from "../src/lib/types";
import { getRawOutputPath, getTransparentOutputPath, padDinoId } from "./art-pipeline";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const GEMINI_APP_ID = "google/gemini-3-1-flash-image-preview";
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
const MAX_ATTEMPTS = 3;
const STAGES: Stage[] = ["hatchling", "juvenile", "adult"];
const MAX_MEAN_ABSOLUTE_CHANNEL_DELTA = 6;
const MAX_BOUNDING_BOX_SHIFT_PIXELS = 12;
const NEAR_WHITE_THRESHOLD = 248;
const DINO_ENTRIES = dinos as DinoEntry[];

type EditBackend = "infsh" | "gemini";

export interface TransparencyValidationMetrics {
  transparentPixels: number;
  rawOpaqueNearWhitePixels: number;
  editedOpaqueNearWhitePixels: number;
  meanAbsoluteChannelDelta: number;
  boundingBoxShiftPixels: number;
}

interface InfshEditResponseImage {
  data?: string;
  b64_json?: string;
  image?: string;
  url?: string;
  path?: string;
}

interface InfshEditResponsePayload {
  images?: Array<string | InfshEditResponseImage>;
  output?: {
    images?: Array<string | InfshEditResponseImage>;
  };
}

interface GeminiGenerateContentPart {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
  inline_data?: {
    data?: string;
    mimeType?: string;
  };
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiGenerateContentPart[];
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
  error?: {
    message?: string;
  };
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface RawRgbImage {
  data: Buffer;
  width: number;
  height: number;
}

interface RawRgbaImage extends RawRgbImage {
  channels: number;
}

type SharpRawChannels = 3 | 4;

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function resolveSharpRawChannels(channels: number): SharpRawChannels {
  if (channels === 3 || channels === 4) {
    return channels;
  }

  throw new Error(`Unsupported raw image channel count: ${channels}`);
}

function parseStage(stageArg?: string): Stage | null {
  if (!stageArg) {
    return null;
  }

  if (STAGES.includes(stageArg as Stage)) {
    return stageArg as Stage;
  }

  throw new Error(`Unsupported stage: ${stageArg}`);
}

export function createPilotTasks(args: string[]): Array<{ dinoId: number; stage: Stage }> {
  const isAll = args.includes("--all");
  const dinoIndex = args.indexOf("--dino");
  const stageIndex = args.indexOf("--stage");
  const requestedStage = parseStage(stageIndex >= 0 ? args[stageIndex + 1] : undefined);
  const requestedDino = dinoIndex >= 0 ? Number.parseInt(args[dinoIndex + 1] ?? "", 10) : null;

  if (requestedDino !== null && Number.isNaN(requestedDino)) {
    throw new Error("Expected a numeric value after --dino");
  }

  if (isAll) {
    return DINO_ENTRIES.flatMap((entry) =>
      (requestedStage ? [requestedStage] : STAGES).map((stage) => ({ dinoId: entry.id, stage }))
    );
  }

  const dinoId = requestedDino ?? 1;
  return (requestedStage ? [requestedStage] : STAGES).map((stage) => ({ dinoId, stage }));
}

export function shouldPreferAiEdits(args: string[]): boolean {
  return args.includes("--prefer-ai");
}

export function buildTransparencyEditPrompt(): string {
  return [
    "Edit this exact image only.",
    "Preserve the dinosaur's pose, silhouette, anatomy, proportions, palette, shading, framing, and linework.",
    "Remove only the background and negative-space fill so the subject is isolated on a transparent background.",
    "Keep the subject edges clean and natural with no white fringe or halo.",
    "Do not redesign, restyle, relight, crop, sharpen, repaint, or add/remove features.",
  ].join(" ");
}

export function shouldAcceptTransparencyEdit(metrics: TransparencyValidationMetrics): boolean {
  const requiredOpaqueNearWhiteCount =
    metrics.rawOpaqueNearWhitePixels === 0
      ? metrics.editedOpaqueNearWhitePixels === 0
      : metrics.editedOpaqueNearWhitePixels <= metrics.rawOpaqueNearWhitePixels * 0.1;

  return (
    metrics.transparentPixels > 0 &&
    requiredOpaqueNearWhiteCount &&
    metrics.meanAbsoluteChannelDelta <= MAX_MEAN_ABSOLUTE_CHANNEL_DELTA &&
    metrics.boundingBoxShiftPixels <= MAX_BOUNDING_BOX_SHIFT_PIXELS
  );
}

export function resolveEditBackend(options: {
  infshAvailable: boolean;
  geminiApiKey: string;
}): EditBackend {
  if (options.infshAvailable) {
    return "infsh";
  }

  if (options.geminiApiKey) {
    return "gemini";
  }

  throw new Error("No available image editing backend");
}

function getInputPath(dinoId: number, stage: Stage): string {
  return getRawOutputPath(PROJECT_ROOT, dinoId, stage, "png");
}

function getAttemptOutputPath(dinoId: number, stage: Stage, attempt: number): string {
  return join(PROJECT_ROOT, "scripts", "transparent-output", padDinoId(dinoId), `${stage}.attempt-${attempt}.png`);
}

async function readRawRgbaImage(path: string): Promise<RawRgbaImage> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

async function readFlattenedRgbImage(path: string): Promise<RawRgbImage> {
  const { data, info } = await sharp(path)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}

function isNearWhite(r: number, g: number, b: number): boolean {
  return r > NEAR_WHITE_THRESHOLD && g > NEAR_WHITE_THRESHOLD && b > NEAR_WHITE_THRESHOLD;
}

function countOpaqueNearWhitePixels(image: RawRgbaImage): number {
  let count = 0;

  for (let index = 0; index < image.data.length; index += image.channels) {
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];

    if (a === 255 && isNearWhite(r, g, b)) {
      count++;
    }
  }

  return count;
}

function countTransparentPixels(image: RawRgbaImage): number {
  let count = 0;

  for (let index = 3; index < image.data.length; index += image.channels) {
    if (image.data[index] === 0) {
      count++;
    }
  }

  return count;
}

function isNearWhitePixel(data: Uint8Array | Buffer, index: number, channels: number): boolean {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = channels >= 4 ? data[index + 3] : 255;
  return a > 0 && isNearWhite(r, g, b);
}

export function stripEdgeConnectedNearWhiteBackground(
  source: Uint8Array,
  width: number,
  height: number,
  channels: number
): Uint8Array {
  const output = new Uint8Array(source);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function enqueue(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) {
      return;
    }

    const bufferIndex = pixelIndex * channels;
    if (!isNearWhitePixel(output, bufferIndex, channels)) {
      return;
    }

    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  }

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const pixelIndex = queue.shift();
    if (pixelIndex === undefined) {
      continue;
    }

    const bufferIndex = pixelIndex * channels;
    output[bufferIndex + 3] = 0;

    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  return output;
}

function computeForegroundBoundingBox(image: RawRgbImage): BoundingBox | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const index = (y * image.width + x) * 3;
      const r = image.data[index];
      const g = image.data[index + 1];
      const b = image.data[index + 2];

      if (isNearWhite(r, g, b)) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (!Number.isFinite(minX)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

function computeBoundingBoxShiftPixels(a: BoundingBox | null, b: BoundingBox | null): number {
  if (!a || !b) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(
    Math.abs(a.minX - b.minX),
    Math.abs(a.minY - b.minY),
    Math.abs(a.maxX - b.maxX),
    Math.abs(a.maxY - b.maxY)
  );
}

async function computeMeanAbsoluteChannelDelta(originalPath: string, editedPath: string): Promise<number> {
  const original = await readFlattenedRgbImage(originalPath);
  const edited = await readFlattenedRgbImage(editedPath);

  if (original.width !== edited.width || original.height !== edited.height) {
    throw new Error("Edited image dimensions changed unexpectedly.");
  }

  let totalDelta = 0;
  for (let index = 0; index < original.data.length; index++) {
    totalDelta += Math.abs(original.data[index] - edited.data[index]);
  }

  return totalDelta / original.data.length;
}

async function collectTransparencyValidationMetrics(
  originalPath: string,
  editedPath: string
): Promise<TransparencyValidationMetrics> {
  const originalRgba = await readRawRgbaImage(originalPath);
  const editedRgba = await readRawRgbaImage(editedPath);
  const originalRgb = await readFlattenedRgbImage(originalPath);
  const editedRgb = await readFlattenedRgbImage(editedPath);

  return {
    transparentPixels: countTransparentPixels(editedRgba),
    rawOpaqueNearWhitePixels: countOpaqueNearWhitePixels(originalRgba),
    editedOpaqueNearWhitePixels: countOpaqueNearWhitePixels(editedRgba),
    meanAbsoluteChannelDelta: await computeMeanAbsoluteChannelDelta(originalPath, editedPath),
    boundingBoxShiftPixels: computeBoundingBoxShiftPixels(
      computeForegroundBoundingBox(originalRgb),
      computeForegroundBoundingBox(editedRgb)
    ),
  };
}

async function writeDeterministicTransparentFallback(
  inputPath: string,
  outputPath: string
): Promise<TransparencyValidationMetrics> {
  const rawImage = await readRawRgbaImage(inputPath);
  const rawChannels = resolveSharpRawChannels(rawImage.channels);
  const stripped = stripEdgeConnectedNearWhiteBackground(
    rawImage.data,
    rawImage.width,
    rawImage.height,
    rawImage.channels
  );

  ensureDir(dirname(outputPath));
  await sharp(Buffer.from(stripped), {
    raw: {
      width: rawImage.width,
      height: rawImage.height,
      channels: rawChannels,
    },
  })
    .png()
    .toFile(outputPath);

  return collectTransparencyValidationMetrics(inputPath, outputPath);
}

function extractJsonPayload(stdout: string): InfshEditResponsePayload {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("infsh did not return a JSON payload.");
  }

  return JSON.parse(stdout.slice(start, end + 1)) as InfshEditResponsePayload;
}

async function resolveResponseImageToBuffer(response: InfshEditResponsePayload): Promise<Buffer> {
  const imageEntry = response.output?.images?.[0] ?? response.images?.[0];

  if (!imageEntry) {
    throw new Error("infsh response did not include an image.");
  }

  if (typeof imageEntry === "string") {
    if (imageEntry.startsWith("data:image/")) {
      const base64Payload = imageEntry.split(",", 2)[1];
      return Buffer.from(base64Payload, "base64");
    }

    if (imageEntry.startsWith("http://") || imageEntry.startsWith("https://")) {
      const response = await fetch(imageEntry);
      if (!response.ok) {
        throw new Error(`Failed to download edited image from ${imageEntry}`);
      }
      return Buffer.from(await response.arrayBuffer());
    }

    return readFile(imageEntry);
  }

  const base64Payload = imageEntry.data ?? imageEntry.b64_json ?? imageEntry.image;
  if (base64Payload) {
    return Buffer.from(base64Payload, "base64");
  }

  if (imageEntry.url) {
    const response = await fetch(imageEntry.url);
    if (!response.ok) {
      throw new Error(`Failed to download edited image from ${imageEntry.url}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  if (imageEntry.path) {
    return readFile(imageEntry.path);
  }

  throw new Error("infsh returned an unsupported image payload.");
}

async function isInfshAvailable(): Promise<boolean> {
  const result = await new Promise<{ exitCode: number | null }>((resolve) => {
    const child = spawn("infsh", ["--help"], {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.on("error", () => resolve({ exitCode: 1 }));
    child.on("close", (code) => resolve({ exitCode: code }));
  });

  return result.exitCode === 0;
}

async function runInfshEdit(inputPath: string): Promise<Buffer> {
  const prompt = buildTransparencyEditPrompt();
  const payload = JSON.stringify({
    prompt,
    images: [inputPath],
    num_images: 1,
    aspect_ratio: "1:1",
    resolution: "1K",
    output_format: "png",
  });

  const { stdout, stderr, exitCode } = await new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>((resolve, reject) => {
    const child = spawn("infsh", ["app", "run", GEMINI_APP_ID, "--input", payload], {
      cwd: PROJECT_ROOT,
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
    child.on("close", (code) => {
      resolve({ stdout, stderr, exitCode: code });
    });
  });

  if (exitCode !== 0) {
    const detail = stderr.trim() || stdout.trim() || `infsh exited with code ${exitCode}`;
    throw new Error(detail);
  }

  const responsePayload = extractJsonPayload(stdout);
  return resolveResponseImageToBuffer(responsePayload);
}

function extractGeminiInlineImage(response: GeminiGenerateContentResponse) {
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData ?? part.inline_data;
      if (inlineData?.data && inlineData.mimeType) {
        return inlineData;
      }
    }
  }

  return null;
}

async function runGeminiEdit(inputPath: string): Promise<Buffer> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
  }

  const imageBuffer = await readFile(inputPath);
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
  );
  url.searchParams.set("key", GEMINI_API_KEY);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildTransparencyEditPrompt() },
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/png",
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    }),
  });

  const responseText = await response.text();
  const parsed = responseText ? (JSON.parse(responseText) as GeminiGenerateContentResponse) : {};

  if (!response.ok) {
    throw new Error(
      parsed.error?.message ??
        `Gemini request failed with HTTP ${response.status} ${response.statusText}`
    );
  }

  const inlineImage = extractGeminiInlineImage(parsed);
  if (!inlineImage?.data) {
    const reason = [
      parsed.promptFeedback?.blockReason,
      parsed.promptFeedback?.blockReasonMessage,
    ]
      .filter(Boolean)
      .join(" | ");
    throw new Error(reason || "Gemini response did not include an inline image.");
  }

  return Buffer.from(inlineImage.data, "base64");
}

async function renderTransparentEdit(inputPath: string, outputPath: string): Promise<void> {
  const backend = resolveEditBackend({
    infshAvailable: await isInfshAvailable(),
    geminiApiKey: GEMINI_API_KEY,
  });
  const imageBuffer = backend === "infsh" ? await runInfshEdit(inputPath) : await runGeminiEdit(inputPath);
  ensureDir(dirname(outputPath));
  await writeFile(outputPath, imageBuffer);
}

async function promoteAttemptOutput(attemptPath: string, finalPath: string) {
  ensureDir(dirname(finalPath));
  await copyFile(attemptPath, finalPath);
  await rm(attemptPath, { force: true });
}

async function processTask(dinoId: number, stage: Stage, preferAiEdits: boolean) {
  const inputPath = getInputPath(dinoId, stage);

  if (!existsSync(inputPath)) {
    throw new Error(`Missing raw input image at ${inputPath}`);
  }

  const finalOutputPath = getTransparentOutputPath(PROJECT_ROOT, dinoId, stage);

  if (!preferAiEdits) {
    const fallbackMetrics = await writeDeterministicTransparentFallback(inputPath, finalOutputPath);
    if (!shouldAcceptTransparencyEdit(fallbackMetrics)) {
      throw new Error(
        `Deterministic transparency strip failed validation for ${padDinoId(dinoId)}/${stage}: ${JSON.stringify(fallbackMetrics)}`
      );
    }

    console.log(`  Accepted deterministic strip -> ${finalOutputPath}`);
    return;
  }

  let lastFailureReason = "Unknown validation failure";

  console.log(`Editing ${padDinoId(dinoId)}/${stage} from ${inputPath}`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const attemptOutputPath = getAttemptOutputPath(dinoId, stage, attempt);

    try {
      await renderTransparentEdit(inputPath, attemptOutputPath);
      const metrics = await collectTransparencyValidationMetrics(inputPath, attemptOutputPath);

      if (!shouldAcceptTransparencyEdit(metrics)) {
        lastFailureReason = JSON.stringify(metrics);
        await rm(attemptOutputPath, { force: true });
        console.log(`  Attempt ${attempt}/${MAX_ATTEMPTS} rejected: ${lastFailureReason}`);
        continue;
      }

      await promoteAttemptOutput(attemptOutputPath, finalOutputPath);
      console.log(`  Accepted attempt ${attempt}/${MAX_ATTEMPTS} -> ${finalOutputPath}`);
      return;
    } catch (error) {
      lastFailureReason = error instanceof Error ? error.message : String(error);
      await rm(attemptOutputPath, { force: true });
      console.log(`  Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastFailureReason}`);
    }
  }

  const fallbackOutputPath = getAttemptOutputPath(dinoId, stage, MAX_ATTEMPTS + 1);
  const fallbackMetrics = await writeDeterministicTransparentFallback(inputPath, fallbackOutputPath);
  if (shouldAcceptTransparencyEdit(fallbackMetrics)) {
    await promoteAttemptOutput(fallbackOutputPath, finalOutputPath);
    console.log(`  Accepted deterministic fallback -> ${finalOutputPath}`);
    return;
  }

  await rm(fallbackOutputPath, { force: true });

  throw new Error(`Failed to produce an acceptable transparent edit for ${padDinoId(dinoId)}/${stage}: ${lastFailureReason}`);
}

async function main() {
  const args = process.argv.slice(2);
  const tasks = createPilotTasks(args);
  const preferAiEdits = shouldPreferAiEdits(args);
  console.log(`Processing ${tasks.length} transparent edit task(s).`);
  console.log(
    preferAiEdits
      ? "Mode: AI edit attempts first, deterministic fallback on validation failure."
      : "Mode: deterministic exact-preservation strip."
  );

  for (const task of tasks) {
    await processTask(task.dinoId, task.stage, preferAiEdits);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
