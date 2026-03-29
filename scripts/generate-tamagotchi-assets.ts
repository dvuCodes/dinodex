import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import dinos from "../src/data/dinos.json";
import type { DinoEntry, Stage } from "../src/lib/types";
import { findPreferredArtSourcePath } from "./art-pipeline";
import {
  getEggVariantKey,
  getTamagotchiManifestPath,
  getTamagotchiSpriteOutputPath,
  getTamagotchiSpriteUrl,
  getTamagotchiStageList,
  padTamagotchiId,
  type TamagotchiStage,
} from "./tamagotchi-art-pipeline";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const OUTPUT_ROOT = join(PROJECT_ROOT, "public", "tamagotchi");
const SOURCE_STAGE_SIZE = 64;
const OUTPUT_STAGE_SIZE = 256;
const DINO_ENTRIES = dinos as DinoEntry[];
const SOURCE_STAGES: Stage[] = ["hatchling", "juvenile", "adult"];

interface ManifestSpriteEntry {
  stage: TamagotchiStage;
  url: string;
}

interface ManifestSpeciesEntry {
  id: number;
  name: string;
  eggVariant: string;
  sprites: ManifestSpriteEntry[];
}

interface ManifestFile {
  version: number;
  generatedAt: string;
  spriteSize: number;
  sourceGridSize: number;
  stageOrder: TamagotchiStage[];
  species: ManifestSpeciesEntry[];
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs((2 * l) - 1)) * s;
  const huePrime = (hue % 360) / 60;
  const x = c * (1 - Math.abs((huePrime % 2) - 1));

  let [r1, g1, b1] = [0, 0, 0];
  if (huePrime >= 0 && huePrime < 1) [r1, g1, b1] = [c, x, 0];
  else if (huePrime < 2) [r1, g1, b1] = [x, c, 0];
  else if (huePrime < 3) [r1, g1, b1] = [0, c, x];
  else if (huePrime < 4) [r1, g1, b1] = [0, x, c];
  else if (huePrime < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  const toHex = (value: number) => {
    const channel = Math.round((value + m) * 255);
    return channel.toString(16).padStart(2, "0");
  };

  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

function getDinoEntry(dinoId: number): DinoEntry {
  const entry = DINO_ENTRIES.find((dino) => dino.id === dinoId);
  if (!entry) {
    throw new Error(`Missing dino data for ${dinoId}`);
  }
  return entry;
}

function buildStageSourcePath(dinoId: number, stage: Stage): string | null {
  return findPreferredArtSourcePath(PROJECT_ROOT, dinoId, stage, existsSync);
}

function buildEggPalette(dinoId: number) {
  const hue = (dinoId * 47) % 360;
  const accent = hslToHex(hue, 70, 56);
  const accentDark = hslToHex(hue, 58, 34);
  const accentLight = hslToHex(hue, 62, 74);
  const shell = "#F5EBDC";
  const shellShade = "#E2D0B7";
  const outline = "#4A3B2F";
  const highlight = "#FFF8F0";

  return { accent, accentDark, accentLight, shell, shellShade, outline, highlight };
}

function drawEggPixelGrid(dinoId: number): string {
  const palette = buildEggPalette(dinoId);
  const variant = getEggVariantKey(dinoId);
  const pixels: string[] = [];
  const gridSize = 16;
  const tile = 4;

  const isEggBody = (x: number, y: number) => {
    const dx = (x - 7.5) / 5.7;
    const dy = (y - 8.2) / 6.9;
    return (dx * dx) + (dy * dy) <= 1;
  };

  const isOutline = (x: number, y: number) => {
    if (!isEggBody(x, y)) {
      return false;
    }
    return (
      !isEggBody(x - 1, y) ||
      !isEggBody(x + 1, y) ||
      !isEggBody(x, y - 1) ||
      !isEggBody(x, y + 1)
    );
  };

  const isHighlight = (x: number, y: number) => x <= 5 && y <= 5 && isEggBody(x, y);

  const isPattern = (x: number, y: number) => {
    if (!isEggBody(x, y) || isOutline(x, y) || isHighlight(x, y)) {
      return false;
    }

    switch (variant) {
      case "banded":
        return y === 7 || y === 8 || y === 9 || (x === 5 && y >= 5 && y <= 10) || (x === 10 && y >= 5 && y <= 10);
      case "speckled":
        return ((x * 11) + (y * 7) + dinoId) % 9 === 0 || ((x + y + dinoId) % 11 === 0);
      case "ringed":
        return Math.abs(x - 7.5) >= 2.5 && Math.abs(y - 8.2) >= 2.5 && ((x + y + dinoId) % 4 === 0);
      case "zigzag":
        return ((x + (y * 2) + dinoId) % 5 === 0) || ((x - y + 16 + dinoId) % 6 === 0);
      case "swirled":
        return ((x - 8) * (x - 8)) + ((y - 8) * (y - 8)) <= 18 && ((x + y + dinoId) % 3 === 0);
      default:
        return false;
    }
  };

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (x < 2 || x > 13 || y < 1 || y > 14) {
        continue;
      }

      let fill: string | null = null;
      if (isOutline(x, y)) {
        fill = palette.outline;
      } else if (isHighlight(x, y)) {
        fill = palette.highlight;
      } else if (isPattern(x, y)) {
        fill = palette.accent;
      } else if (isEggBody(x, y)) {
        fill = palette.shell;
      }

      if (!fill) {
        continue;
      }

      pixels.push(
        `<rect x="${x * tile}" y="${y * tile}" width="${tile}" height="${tile}" fill="${fill}" />`
      );
    }
  }

  // Add a tiny grounded shadow so the egg does not float on transparent backgrounds.
  pixels.push(
    `<rect x="20" y="52" width="24" height="4" fill="${palette.shellShade}" opacity="0.55" />`
  );
  pixels.push(
    `<rect x="24" y="48" width="16" height="4" fill="${palette.shellShade}" opacity="0.35" />`
  );
  pixels.push(
    `<rect x="28" y="20" width="4" height="4" fill="${palette.accentLight}" />`
  );

  return pixels.join("");
}

function buildEggSpriteSvg(dinoId: number): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT_STAGE_SIZE}" height="${OUTPUT_STAGE_SIZE}" viewBox="0 0 64 64" shape-rendering="crispEdges">`,
    `<rect width="64" height="64" fill="transparent" />`,
    drawEggPixelGrid(dinoId),
    `</svg>`,
  ].join("");
}

async function writeEggSprite(dinoId: number, outputPath: string) {
  const eggSvg = buildEggSpriteSvg(dinoId);
  ensureDir(join(outputPath, ".."));
  await sharp(Buffer.from(eggSvg))
    .png({ compressionLevel: 9 })
    .resize(OUTPUT_STAGE_SIZE, OUTPUT_STAGE_SIZE, { kernel: sharp.kernel.nearest })
    .toFile(outputPath);
}

async function writeStageSprite(dinoId: number, stage: Stage, outputPath: string) {
  const sourcePath = buildStageSourcePath(dinoId, stage);
  if (!sourcePath) {
    throw new Error(`Missing source art for dino #${padTamagotchiId(dinoId)} stage ${stage}`);
  }

  ensureDir(join(outputPath, ".."));
  const resized = sharp(sourcePath)
    .ensureAlpha()
    .resize(SOURCE_STAGE_SIZE, SOURCE_STAGE_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.nearest,
    })
    .resize(OUTPUT_STAGE_SIZE, OUTPUT_STAGE_SIZE, {
      fit: "fill",
      kernel: sharp.kernel.nearest,
    });

  await resized.png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(outputPath);
}

function buildManifestEntry(dinoId: number): ManifestSpeciesEntry {
  const dino = getDinoEntry(dinoId);
  const sprites: ManifestSpriteEntry[] = getTamagotchiStageList().map((stage) => ({
    stage,
    url: getTamagotchiSpriteUrl(dinoId, stage),
  }));

  return {
    id: dinoId,
    name: dino.name,
    eggVariant: getEggVariantKey(dinoId),
    sprites,
  };
}

async function generateSpeciesAssets(dinoId: number) {
  const entries = getTamagotchiStageList();
  for (const stage of entries) {
    const outputPath = getTamagotchiSpriteOutputPath(PROJECT_ROOT, dinoId, stage);
    if (stage === "egg") {
      await writeEggSprite(dinoId, outputPath);
    } else {
      await writeStageSprite(dinoId, stage, outputPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const dinoArg = args.indexOf("--dino");
  const specificDino = dinoArg !== -1 ? Number.parseInt(args[dinoArg + 1] ?? "", 10) : null;

  if (specificDino !== null && Number.isNaN(specificDino)) {
    throw new Error("Expected a numeric value after --dino");
  }

  const targets = isAll
    ? DINO_ENTRIES.map((entry) => entry.id)
    : specificDino
      ? [specificDino]
      : [];

  if (targets.length === 0) {
    console.log("Usage:");
    console.log("  bun run scripts/generate-tamagotchi-assets.ts --all");
    console.log("  bun run scripts/generate-tamagotchi-assets.ts --dino 18");
    process.exit(0);
  }

  ensureDir(OUTPUT_ROOT);

  const manifest: ManifestFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    spriteSize: OUTPUT_STAGE_SIZE,
    sourceGridSize: SOURCE_STAGE_SIZE,
    stageOrder: getTamagotchiStageList(),
    species: [],
  };

  console.log(`Generating tamagotchi assets for ${targets.length} species...`);

  for (const dinoId of targets) {
    console.log(`  #${padTamagotchiId(dinoId)} ${getDinoEntry(dinoId).name}`);
    await generateSpeciesAssets(dinoId);
    manifest.species.push(buildManifestEntry(dinoId));
  }

  const manifestPath = getTamagotchiManifestPath(PROJECT_ROOT);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  console.log(`Wrote manifest -> ${manifestPath}`);
  console.log(`Wrote assets -> ${OUTPUT_ROOT}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
