import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = join(import.meta.dirname, "..");
const EORAPTOR_DIR = join(PROJECT_ROOT, "public", "tamagotchi", "001");
const FRAME_COUNT = 4;
const ALPHA_THRESHOLD = 0;

type Component = {
  pixels: number[];
  size: number;
};

function isTargetStripFile(fileName: string): boolean {
  return /\.(png)$/i.test(fileName) && /^(hatchling|juvenile|adult)-(idle|happy|sleepy|sick)\.png$/i.test(fileName);
}

function getLargestComponent(raw: Buffer, frameWidth: number, frameHeight: number, startX: number, fullWidth: number): Component | null {
  const visited = new Uint8Array(frameWidth * frameHeight);
  let largest: Component | null = null;

  const alphaAt = (x: number, y: number) => raw[((y * fullWidth) + (startX + x)) * 4 + 3];

  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const index = (y * frameWidth) + x;
      if (visited[index] || alphaAt(x, y) <= ALPHA_THRESHOLD) {
        continue;
      }

      const queue = [index];
      const pixels: number[] = [];
      visited[index] = 1;

      while (queue.length > 0) {
        const current = queue.pop();
        if (current === undefined) {
          continue;
        }

        pixels.push(current);
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
          if (nextX < 0 || nextY < 0 || nextX >= frameWidth || nextY >= frameHeight) {
            continue;
          }

          const nextIndex = (nextY * frameWidth) + nextX;
          if (visited[nextIndex] || alphaAt(nextX, nextY) <= ALPHA_THRESHOLD) {
            continue;
          }

          visited[nextIndex] = 1;
          queue.push(nextIndex);
        }
      }

      if (!largest || pixels.length > largest.size) {
        largest = { pixels, size: pixels.length };
      }
    }
  }

  return largest;
}

async function repairStrip(path: string): Promise<{ removedPixels: number; frameWidth: number; width: number; height: number }> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height || info.width % FRAME_COUNT !== 0) {
    throw new Error(`Unexpected strip dimensions for ${path}: ${info.width}x${info.height}`);
  }

  const frameWidth = info.width / FRAME_COUNT;
  const output = Buffer.alloc(data.length, 0);
  let removedPixels = 0;

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const startX = frame * frameWidth;
    const component = getLargestComponent(data, frameWidth, info.height, startX, info.width);
    if (!component) {
      continue;
    }

    const keep = new Set(component.pixels);
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        const localIndex = (y * frameWidth) + x;
        const sourceIndex = ((y * info.width) + (startX + x)) * 4;
        if (!keep.has(localIndex)) {
          if (data[sourceIndex + 3] > ALPHA_THRESHOLD) {
            removedPixels += 1;
          }
          continue;
        }

        output[sourceIndex] = data[sourceIndex];
        output[sourceIndex + 1] = data[sourceIndex + 1];
        output[sourceIndex + 2] = data[sourceIndex + 2];
        output[sourceIndex + 3] = data[sourceIndex + 3];
      }
    }
  }

  const repaired = await sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync(path, repaired);
  return { removedPixels, frameWidth, width: info.width, height: info.height };
}

async function main() {
  const targets = readdirSync(EORAPTOR_DIR)
    .filter(isTargetStripFile)
    .map((fileName) => join(EORAPTOR_DIR, fileName));

  if (targets.length === 0) {
    throw new Error(`No Eoraptor strips found in ${EORAPTOR_DIR}`);
  }

  for (const target of targets) {
    const result = await repairStrip(target);
    console.log(`${target}: removed ${result.removedPixels} stray pixels across ${FRAME_COUNT} frames (${result.width}x${result.height}, frameWidth=${result.frameWidth})`);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
