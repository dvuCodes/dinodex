import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const RAW_OUTPUT_DIR = join(PROJECT_ROOT, "scripts", "raw-output");
const PUBLIC_DINOS_DIR = join(PROJECT_ROOT, "public", "dinos");
const RAW_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

type Stage = "hatchling" | "juvenile" | "adult";
const STAGES: Stage[] = ["hatchling", "juvenile", "adult"];

function padId(id: number): string {
  return String(id).padStart(3, "0");
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function findRawPath(dinoId: number, stage: Stage): string | null {
  const paddedId = padId(dinoId);

  for (const extension of RAW_EXTENSIONS) {
    const candidate = join(RAW_OUTPUT_DIR, paddedId, `${stage}.${extension}`);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function processImage(dinoId: number, stage: Stage): Promise<boolean> {
  const paddedId = padId(dinoId);
  const rawPath = findRawPath(dinoId, stage);

  if (!rawPath) {
    console.log(`  Skipping ${paddedId}/${stage} - no raw image found`);
    return false;
  }

  const outputDir = join(PUBLIC_DINOS_DIR, paddedId);
  ensureDir(outputDir);

  const fullPath = join(outputDir, `${stage}.webp`);
  const thumbPath = join(outputDir, `${stage}-thumb.webp`);

  try {
    await sharp(rawPath)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 85 })
      .toFile(fullPath);

    await sharp(rawPath)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    const fullSize = Math.round(statSync(fullPath).size / 1024);
    const thumbSize = Math.round(statSync(thumbPath).size / 1024);

    console.log(`  Processed ${paddedId}/${stage} - full: ${fullSize}KB, thumb: ${thumbSize}KB`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  FAILED ${paddedId}/${stage}: ${message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const dinoArg = args.indexOf("--dino");
  const stageArg = args.indexOf("--stage");

  const specificDino = dinoArg !== -1 ? parseInt(args[dinoArg + 1], 10) : null;
  const specificStage = stageArg !== -1 ? (args[stageArg + 1] as Stage) : null;

  let tasks: Array<{ dinoId: number; stage: Stage }> = [];

  if (isAll) {
    if (!existsSync(RAW_OUTPUT_DIR)) {
      console.error("No raw output directory found. Run generate-art.ts first.");
      process.exit(1);
    }

    const dirs = readdirSync(RAW_OUTPUT_DIR).filter((dir) => /^\d{3}$/.test(dir)).sort();
    for (const dir of dirs) {
      const id = parseInt(dir, 10);
      for (const stage of STAGES) {
        tasks.push({ dinoId: id, stage });
      }
    }

    console.log(`\nProcessing ${tasks.length} image(s) from raw output...\n`);
  } else if (specificDino) {
    for (const stage of specificStage ? [specificStage] : STAGES) {
      tasks.push({ dinoId: specificDino, stage });
    }
    console.log(`\nProcessing ${tasks.length} image(s) for dino #${padId(specificDino)}...\n`);
  } else {
    console.log("Usage:");
    console.log("  bun run scripts/process-images.ts --all");
    console.log("  bun run scripts/process-images.ts --dino 18");
    console.log("  bun run scripts/process-images.ts --dino 18 --stage adult");
    process.exit(0);
  }

  let successCount = 0;
  let skipCount = 0;
  let failureCount = 0;

  for (const task of tasks) {
    const result = await processImage(task.dinoId, task.stage);
    if (result) {
      successCount++;
      continue;
    }

    if (!findRawPath(task.dinoId, task.stage)) {
      skipCount++;
    } else {
      failureCount++;
    }
  }

  console.log(`\n${"=".repeat(48)}`);
  console.log("Processing complete");
  console.log(`  Processed: ${successCount}`);
  console.log(`  Skipped:   ${skipCount}`);
  console.log(`  Failed:    ${failureCount}`);
  console.log(`  Output:    ${PUBLIC_DINOS_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
