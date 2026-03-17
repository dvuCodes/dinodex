import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import dinos from "../src/data/dinos.json";
import type { DinoEntry, Stage } from "../src/lib/types";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const RAW_OUTPUT_DIR = join(PROJECT_ROOT, "scripts", "raw-output");
const LOG_PATH = join(PROJECT_ROOT, "scripts", "generation-log.json");
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
const REQUEST_TIMEOUT_MS = 180_000;
const DELAY_MS = 2_500;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const STAGES: Stage[] = ["hatchling", "juvenile", "adult"];
const RAW_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;
const DINO_ENTRIES = dinos as DinoEntry[];

const BASE_COLORS: Record<number, string> = {
  1: "warm sandy brown",
  2: "dusty orange-red",
  3: "forest green",
  4: "deep crimson",
  5: "dark slate gray with olive",
  6: "deep blue with red accents",
  7: "warm earthy green",
  8: "sky blue with cream underbelly",
  9: "warm tan with darker back stripe",
  10: "iridescent blue-black with gold",
  11: "bright lime green",
  12: "tropical teal with red crests",
  13: "dark purple with red horn",
  14: "warm brown with yellow spikes",
  15: "dark forest green",
  16: "warm gray-brown",
  17: "dark red-orange",
  18: "dark brown with amber",
  19: "earthy olive green with tan frill",
  20: "burnt orange with cream feathers",
  21: "deep teal with red sail",
  22: "dark brown with tan armor",
  23: "warm gold with teal crest",
  24: "warm brown with golden dome",
  25: "deep red with dark accents",
  26: "dark brown with white feathers",
  27: "dark gunmetal gray with red",
  28: "dark teal-blue with feathers",
  29: "sandy beige with tan frill",
  30: "bone white with amber wings",
};

const SPECIES_FEATURES: Record<number, string> = {
  1: "small slender theropod silhouette, long tail, five-fingered grasping hands, mixed-diet teeth, dog-sized proportions",
  2: "extremely slender body, long neck, narrow skull with sharp teeth, hollow-boned runner proportions, long balancing tail",
  3: "early sauropodomorph build, long neck, bulky herbivore torso, large thumb claw, able to look bipedal or quadrupedal",
  4: "primitive theropod body, powerful jaws, muscular build, strong grasping forelimbs, deep predatory skull",
  5: "upright rauisuchian archosaur, crocodile-like deep skull, armored osteoderms along the back, pillar-like limbs, heavy tail",
  6: "large theropod silhouette, horn crests above the eyes, massive skull, strong three-fingered arms, powerful neck",
  7: "arched back with distinctive plates, tiny head, stocky herbivore body, four tail spikes, quadrupedal stance",
  8: "very long upward neck, tiny head, front legs longer than hind legs, giraffe-like shoulders, gigantic sauropod stance",
  9: "extremely long whip tail, long slender neck, tiny skull, elegant elongated sauropod body, horizontal silhouette",
  10: "feathered dinosaur-bird hybrid, toothed beak, clawed wing fingers, long feathered tail, early bird anatomy",
  11: "very small theropod shape, chicken-sized proportions, simple sleek body, large eyes, long thin tail",
  12: "twin head crests, slender predatory frame, long neck, narrow snout, classic medium theropod silhouette",
  13: "nose horn, small brow horns, osteoderms along the back, deep predatory skull, flexible theropod body",
  14: "flat shoulder plates transitioning into spikes, shoulder spikes, tiny head, powerful tail, compact armored herbivore body",
  15: "classic robust large theropod, heavy skull, powerful jaws, muscular hind legs, solid stocky predator frame",
  16: "massive barrel body, thick neck, whip tail, elephant-like legs, immense heavy sauropod silhouette",
  17: "large theropod body, bony ridges on the skull, powerful jaws, strong arms, robust apex predator proportions",
  18: "massive skull, two-fingered arms, muscular legs, thick tail, forward-facing predator gaze, T. Rex silhouette",
  19: "three horns, broad frill, beaked face, rhino-like quadruped body, ceratopsian tank silhouette",
  20: "full feather coverage, sickle claw on the second toe, intelligent raptor face, stiff balancing tail, slim predator build",
  21: "huge back sail, crocodile-like snout, semi-aquatic theropod body, powerful forearms, long paddle-ready tail",
  22: "full-body armor, club tail, low tank-like body, triangular armored head, thick quadruped legs",
  23: "long backward-curving crest, duck bill, elegant hadrosaur body, able to read as bipedal or quadrupedal, herd herbivore posture",
  24: "thick domed skull, bony knobs around the dome, bipedal herbivore body, long tail, headbutting silhouette",
  25: "bull-like horns above the eyes, extremely tiny arms, deep skull, speed-built legs, compact abelisaurid predator shape",
  26: "enormous scythe claws, pot-bellied feathered body, long neck, small head, strange theropod herbivore silhouette",
  27: "narrow elongated skull, slicing teeth, lean giant theropod frame, powerful legs, long heavy tail",
  28: "large feathered dromaeosaur, huge sickle claw, stiff tail, intelligent raptor head, pack hunter silhouette",
  29: "small hornless ceratopsian, strong beak, neck frill, sheep-sized quadruped body, desert herbivore proportions",
  30: "giant pterosaur anatomy, enormous membrane wings, long stiff neck, huge toothless beak, quadrupedal ground stance",
};

const STAGE_STYLE_COPY: Record<Stage, string> = {
  hatchling:
    "Hatchling stage. Chibi kawaii baby design, soft rounded anatomy, big expressive eyes, adorable scale, clearly very young, keep signature species features readable even in baby proportions.",
  juvenile:
    "Juvenile stage. Dynamic shonen action energy, half-grown athletic proportions, more angular features, adventurous expression, fast and lively body language, developing anatomy visible.",
  adult:
    "Adult stage. Fully mature majestic creature art, strong confident stance, premium encyclopedia finish, dramatic but non-magical rim light, dominant readable silhouette, full species features complete.",
};

interface GenerationLogEntry {
  dinoId: number;
  stage: Stage;
  status: "success" | "failure";
  timestamp: string;
  outputPath?: string;
  error?: string;
  promptLength?: number;
  mimeType?: string;
  model?: string;
  attempts?: number;
}

interface GenerationLog {
  entries: GenerationLogEntry[];
  lastRun: string;
}

interface GenerateContentPart {
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

interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: GenerateContentPart[];
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

function padId(id: number): string {
  return String(id).padStart(3, "0");
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function loadLog(): GenerationLog {
  if (existsSync(LOG_PATH)) {
    return JSON.parse(readFileSync(LOG_PATH, "utf-8"));
  }
  return { entries: [], lastRun: "" };
}

function saveLog(log: GenerationLog) {
  log.lastRun = new Date().toISOString();
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

function getDinoEntry(dinoId: number): DinoEntry {
  const entry = DINO_ENTRIES.find((dino) => dino.id === dinoId);
  if (!entry) {
    throw new Error(`Missing dino data for ${dinoId}`);
  }
  return entry;
}

function getRawOutputPath(dinoId: number, stage: Stage, extension: string): string {
  return join(RAW_OUTPUT_DIR, padId(dinoId), `${stage}.${extension}`);
}

function clearExistingRawOutputs(dinoId: number, stage: Stage) {
  for (const extension of RAW_EXTENSIONS) {
    const candidate = getRawOutputPath(dinoId, stage, extension);
    if (existsSync(candidate)) {
      unlinkSync(candidate);
    }
  }
}

function isAlreadyGenerated(log: GenerationLog, dinoId: number, stage: Stage): boolean {
  return log.entries.some(
    (entry) =>
      entry.dinoId === dinoId &&
      entry.stage === stage &&
      entry.status === "success" &&
      entry.outputPath !== undefined &&
      existsSync(entry.outputPath)
  );
}

function getFailures(log: GenerationLog): Array<{ dinoId: number; stage: Stage }> {
  return log.entries
    .filter((entry) => entry.status === "failure")
    .map((entry) => ({ dinoId: entry.dinoId, stage: entry.stage }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      throw new Error(`Unsupported image mime type: ${mimeType}`);
  }
}

function extractImagePart(response: GenerateContentResponse) {
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

function extractTextPart(response: GenerateContentResponse): string | undefined {
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.text) {
        return part.text;
      }
    }
  }
  return undefined;
}

function describeSubject(dino: DinoEntry): string {
  if (dino.type.toLowerCase() === "pterosaur") {
    return `${dino.name}, a prehistoric flying reptile from the ${dino.period}`;
  }
  if (dino.name === "Postosuchus") {
    return `${dino.name}, a rauisuchian archosaur from the ${dino.period}`;
  }
  return `${dino.name}, a ${dino.type.toLowerCase()} from the ${dino.period}`;
}

function buildPrompt(dinoId: number, stage: Stage): string {
  const dino = getDinoEntry(dinoId);
  const stageData = dino.stages[stage];
  const baseColor = BASE_COLORS[dinoId] ?? "earthy natural tones";
  const speciesFeatures = SPECIES_FEATURES[dinoId] ?? dino.type;

  return [
    "Game Freak-inspired monster-collection encyclopedia illustration, premium anime creature art, cel-shaded rendering, bold readable outlines, white seamless background, no props, no humans, no text, no logos, full body visible in a square composition.",
    "Scientifically inspired prehistoric anatomy based on fossil evidence. Keep the exact limb count, hand digit count, skull shape, and signature body structures for the species. Do not invent fantasy features or anthropomorphic anatomy.",
    `Subject: ${describeSubject(dino)} with a consistent palette centered on ${baseColor}.`,
    `Signature anatomy: ${speciesFeatures}.`,
    `Stage behavior cue: ${stageData.description}`,
    `Diet cue for visual attitude only: ${stageData.dietDescription}.`,
    STAGE_STYLE_COPY[stage],
  ].join(" ");
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestImage(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
  }

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
  );
  url.searchParams.set("key", GEMINI_API_KEY);

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K",
      },
    },
  };

  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url.toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        REQUEST_TIMEOUT_MS
      );

      const responseText = await response.text();
      const parsed = responseText ? (JSON.parse(responseText) as GenerateContentResponse) : {};

      if (!response.ok) {
        lastError =
          parsed.error?.message ??
          `Gemini request failed with HTTP ${response.status} ${response.statusText}`;

        if (attempt < MAX_RETRIES && RETRYABLE_STATUS.has(response.status)) {
          await sleep(DELAY_MS * attempt);
          continue;
        }

        throw new Error(lastError);
      }

      const imagePart = extractImagePart(parsed);
      if (!imagePart?.data || !imagePart.mimeType) {
        const details = [
          parsed.promptFeedback?.blockReason,
          parsed.promptFeedback?.blockReasonMessage,
          extractTextPart(parsed),
        ]
          .filter(Boolean)
          .join(" | ");
        throw new Error(details || "Gemini response did not include an inline image.");
      }

      return {
        imageBase64: imagePart.data,
        mimeType: imagePart.mimeType,
        responseText: extractTextPart(parsed),
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_RETRIES) {
        await sleep(DELAY_MS * attempt);
      }
    }
  }

  throw new Error(lastError);
}

async function generateImage(dinoId: number, stage: Stage): Promise<GenerationLogEntry> {
  const prompt = buildPrompt(dinoId, stage);
  const outputDir = join(RAW_OUTPUT_DIR, padId(dinoId));

  ensureDir(outputDir);
  console.log(`  Generating ${padId(dinoId)}/${stage} (${prompt.length} chars)`);

  try {
    const result = await requestImage(prompt);
    const extension = getExtensionFromMimeType(result.mimeType);
    const outputPath = getRawOutputPath(dinoId, stage, extension);

    clearExistingRawOutputs(dinoId, stage);
    ensureDir(outputDir);
    writeFileSync(outputPath, Buffer.from(result.imageBase64, "base64"));

    console.log(`  Saved ${padId(dinoId)}/${stage} -> ${extension}`);
    if (result.responseText) {
      console.log(`  Model note: ${result.responseText}`);
    }

    return {
      dinoId,
      stage,
      status: "success",
      timestamp: new Date().toISOString(),
      outputPath,
      promptLength: prompt.length,
      mimeType: result.mimeType,
      model: GEMINI_MODEL,
      attempts: result.attempts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  FAILED ${padId(dinoId)}/${stage}: ${message}`);

    return {
      dinoId,
      stage,
      status: "failure",
      timestamp: new Date().toISOString(),
      error: message,
      promptLength: prompt.length,
      model: GEMINI_MODEL,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const isResume = args.includes("--resume");
  const isRetryFailures = args.includes("--retry-failures");
  const dinoArg = args.indexOf("--dino");
  const stageArg = args.indexOf("--stage");

  const specificDino = dinoArg !== -1 ? parseInt(args[dinoArg + 1], 10) : null;
  const specificStage = stageArg !== -1 ? (args[stageArg + 1] as Stage) : null;

  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
    process.exit(1);
  }

  ensureDir(RAW_OUTPUT_DIR);
  const log = loadLog();
  let tasks: Array<{ dinoId: number; stage: Stage }> = [];

  if (isRetryFailures) {
    tasks = getFailures(log);
    console.log(`\nRetrying ${tasks.length} failed generations...\n`);
  } else if (isAll) {
    for (const dino of DINO_ENTRIES) {
      for (const stage of STAGES) {
        if (isResume && isAlreadyGenerated(log, dino.id, stage)) {
          continue;
        }
        tasks.push({ dinoId: dino.id, stage });
      }
    }
    console.log(`\nGenerating ${tasks.length} image(s)...\n`);
  } else if (specificDino) {
    for (const stage of specificStage ? [specificStage] : STAGES) {
      tasks.push({ dinoId: specificDino, stage });
    }
    console.log(`\nGenerating ${tasks.length} image(s) for dino #${padId(specificDino)}...\n`);
  } else {
    console.log("Usage:");
    console.log("  bun run scripts/generate-art.ts --all");
    console.log("  bun run scripts/generate-art.ts --dino 18");
    console.log("  bun run scripts/generate-art.ts --dino 18 --stage adult");
    console.log("  bun run scripts/generate-art.ts --all --resume");
    console.log("  bun run scripts/generate-art.ts --retry-failures");
    process.exit(0);
  }

  let successCount = 0;
  let failureCount = 0;

  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index];
    console.log(`[${index + 1}/${tasks.length}] Dino #${padId(task.dinoId)} - ${task.stage}`);

    const entry = await generateImage(task.dinoId, task.stage);
    const existingIndex = log.entries.findIndex(
      (logEntry) => logEntry.dinoId === task.dinoId && logEntry.stage === task.stage
    );

    if (existingIndex >= 0) {
      log.entries[existingIndex] = entry;
    } else {
      log.entries.push(entry);
    }

    saveLog(log);

    if (entry.status === "success") {
      successCount++;
    } else {
      failureCount++;
    }

    if (index < tasks.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"=".repeat(48)}`);
  console.log("Generation complete");
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed:  ${failureCount}`);
  console.log(`  Log:     ${LOG_PATH}`);
  console.log(`  Output:  ${RAW_OUTPUT_DIR}`);

  if (failureCount > 0) {
    console.log("\nRetry failures with: bun run scripts/generate-art.ts --retry-failures");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
