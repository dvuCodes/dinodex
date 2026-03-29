import type { Stage } from "./types";
import type { TamagotchiAnimationState } from "./tamagotchi";

const FRAME_COUNT = 4;
const GRID_SIZE = 16;
const EGG_VARIANT_COUNT = 4;
const EGG_VARIANT_NAMES = ["fern", "sunstone", "berry", "moon"] as const;

const FRAME_DURATIONS: Record<TamagotchiAnimationState, number> = {
  idle: 240,
  happy: 170,
  sleepy: 320,
  sick: 280,
};

const STAGE_SCALE: Record<Stage, number> = {
  hatchling: 0.85,
  juvenile: 1,
  adult: 1.14,
};

type SpriteDescriptor = {
  expectedSrc: string;
  fallbackSrc: string;
  frameCount: number;
  frameDurationMs: number;
  frameSizePx: number;
  displaySizePx: number;
};

type PixelRect = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill: string;
  opacity?: number;
  rx?: number;
};

function padId(id: number): string {
  return String(id).padStart(3, "0");
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)
    .replace(/%0A/g, "")
    .replace(/%20/g, " ")}`;
}

function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function renderRect({ x, y, width = 1, height = 1, fill, opacity, rx }: PixelRect): string {
  const opacityAttr = opacity === undefined ? "" : ` opacity="${opacity}"`;
  const rxAttr = rx === undefined ? "" : ` rx="${rx}"`;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"${opacityAttr}${rxAttr} />`;
}

function getPalette(speciesId: number) {
  const hue = (speciesId * 43) % 360;
  return {
    outline: hsl(hue, 20, 8),
    primary: hsl(hue, 58, 54),
    secondary: hsl((hue + 24) % 360, 68, 68),
    belly: hsl((hue + 8) % 360, 48, 76),
    shadow: hsl(hue, 45, 34),
    accent: hsl((hue + 110) % 360, 72, 64),
  };
}

function getBodyPlan(speciesId: number, stage: Stage) {
  const scale = STAGE_SCALE[stage];
  const baseBodyWidth = Math.round((stage === "adult" ? 7 : stage === "juvenile" ? 6 : 5) * scale);
  const baseBodyHeight = Math.round((stage === "adult" ? 4 : 3) * scale);
  const headWidth = Math.max(2, Math.round((stage === "adult" ? 3 : 2) * scale));
  const headHeight = Math.max(2, Math.round((stage === "adult" ? 3 : 2) * scale));
  const neckLength = speciesId % 5 === 2 ? 2 : 1;
  const tailLength = 2 + (speciesId % 4);
  const legHeight = stage === "hatchling" ? 2 : 3;

  return {
    bodyWidth: baseBodyWidth,
    bodyHeight: baseBodyHeight,
    headWidth,
    headHeight,
    neckLength,
    tailLength,
    legHeight,
    featureMode: speciesId % 6,
    eyeOffsetY: stage === "adult" ? 1 : 0,
  };
}

function createSparkles(frameIndex: number, color: string): string {
  const offsets = [
    [
      { x: 2, y: 3 },
      { x: 13, y: 4 },
    ],
    [
      { x: 3, y: 2 },
      { x: 12, y: 5 },
    ],
    [
      { x: 2, y: 4 },
      { x: 13, y: 3 },
    ],
    [
      { x: 4, y: 2 },
      { x: 11, y: 5 },
    ],
  ][frameIndex];

  return offsets
    .map(({ x, y }) =>
      [
        renderRect({ x, y: y + 1, fill: color }),
        renderRect({ x: x + 1, y, fill: color }),
        renderRect({ x: x + 1, y: y + 1, fill: color }),
        renderRect({ x: x + 1, y: y + 2, fill: color }),
        renderRect({ x: x + 2, y: y + 1, fill: color }),
      ].join("")
    )
    .join("");
}

function createDinoFrame(speciesId: number, stage: Stage, animationState: TamagotchiAnimationState, frameIndex: number): string {
  const palette = getPalette(speciesId);
  const plan = getBodyPlan(speciesId, stage);
  const isHappy = animationState === "happy";
  const isSleepy = animationState === "sleepy";
  const isSick = animationState === "sick";
  const bounce = isHappy ? [0, -1, 0, -1][frameIndex] : isSleepy ? [0, 1, 1, 0][frameIndex] : [0, 0, -1, 0][frameIndex];
  const sway = frameIndex % 2 === 0 ? 0 : 1;
  const bodyX = 4;
  const bodyY = 7 + bounce;
  const headX = bodyX + plan.bodyWidth - 1 + plan.neckLength;
  const headY = bodyY - 2;
  const tailX = Math.max(1, bodyX - plan.tailLength);
  const wingSpan = stage === "adult" ? 4 : 3;
  const detailColor = isSick ? hsl(92, 46, 50) : palette.accent;
  const faceColor = isSick ? hsl(92, 40, 40) : palette.outline;

  const baseRects: PixelRect[] = [
    { x: tailX, y: bodyY + 1, width: plan.tailLength, height: 1, fill: palette.shadow },
    { x: bodyX, y: bodyY, width: plan.bodyWidth, height: plan.bodyHeight, fill: palette.primary, rx: 1 },
    { x: bodyX + 1, y: bodyY + 1, width: Math.max(2, plan.bodyWidth - 2), height: Math.max(1, plan.bodyHeight - 1), fill: palette.secondary },
    { x: bodyX + 1, y: bodyY + 2, width: Math.max(2, plan.bodyWidth - 3), height: 1, fill: palette.belly },
    { x: headX, y: headY, width: plan.headWidth, height: plan.headHeight, fill: palette.primary, rx: 1 },
    { x: headX + 1, y: headY + 1, width: Math.max(1, plan.headWidth - 1), height: Math.max(1, plan.headHeight - 1), fill: palette.secondary },
    { x: bodyX + plan.bodyWidth - 1, y: bodyY - 1, width: plan.neckLength + 1, height: 2, fill: palette.primary },
    { x: bodyX + 1, y: bodyY + plan.bodyHeight, width: 1, height: plan.legHeight, fill: palette.outline },
    { x: bodyX + plan.bodyWidth - 2, y: bodyY + plan.bodyHeight + (sway ? 1 : 0), width: 1, height: plan.legHeight - (sway ? 1 : 0), fill: palette.outline },
    { x: bodyX + 2, y: bodyY + plan.bodyHeight + (sway ? 0 : 1), width: 1, height: plan.legHeight - (sway ? 0 : 1), fill: palette.outline },
  ];

  if (stage !== "hatchling") {
    baseRects.push({ x: bodyX + 2, y: bodyY - 1, width: 2, height: 1, fill: palette.shadow });
  }

  if (plan.featureMode === 0) {
    baseRects.push({ x: headX, y: headY - 1, width: 1, height: 1, fill: detailColor });
    baseRects.push({ x: headX + plan.headWidth - 1, y: headY - 1, width: 1, height: 1, fill: detailColor });
  } else if (plan.featureMode === 1) {
    baseRects.push({ x: headX + 1, y: headY - 1, width: 2, height: 1, fill: detailColor });
  } else if (plan.featureMode === 2) {
    baseRects.push({ x: bodyX + 1, y: bodyY - 1, width: Math.max(2, plan.bodyWidth - 2), height: 1, fill: detailColor });
  } else if (plan.featureMode === 3) {
    baseRects.push({ x: headX - 1, y: headY + 1, width: 1, height: 2, fill: detailColor });
    baseRects.push({ x: headX - 2, y: headY + 2, width: 1, height: 1, fill: detailColor });
  } else if (plan.featureMode === 4) {
    baseRects.push({ x: bodyX + 2, y: bodyY - 2, width: 2, height: 2, fill: detailColor });
    baseRects.push({ x: bodyX + 4, y: bodyY - 2, width: 1, height: 1, fill: detailColor });
  } else {
    baseRects.push({ x: bodyX + 1, y: bodyY - 1, width: wingSpan, height: 1, fill: detailColor, opacity: 0.72 });
    baseRects.push({ x: bodyX + plan.bodyWidth - 2, y: bodyY - 1, width: wingSpan - 1, height: 1, fill: detailColor, opacity: 0.72 });
  }

  const face =
    isSleepy
      ? renderRect({ x: headX + 1, y: headY + 1 + plan.eyeOffsetY, width: 2, height: 1, fill: faceColor })
      : [
          renderRect({ x: headX + 1, y: headY + 1 + plan.eyeOffsetY, fill: "#fff" }),
          renderRect({ x: headX + 2, y: headY + 1 + plan.eyeOffsetY, fill: isHappy ? palette.accent : faceColor }),
        ].join("");

  const extras = [
    isHappy ? createSparkles(frameIndex, palette.accent) : "",
    isSleepy
      ? `<text x="${headX + 5}" y="${headY + 2}" font-size="3" font-family="monospace" fill="${detailColor}">z</text>`
      : "",
    isSick ? renderRect({ x: bodyX + 1, y: bodyY - 2, width: 2, height: 1, fill: detailColor }) : "",
    isSick ? renderRect({ x: bodyX + 1, y: bodyY - 3, width: 1, height: 3, fill: detailColor }) : "",
  ].join("");

  return [
    `<g transform="translate(${frameIndex * GRID_SIZE},0)">`,
    renderRect({ x: 0, y: GRID_SIZE - 2, width: GRID_SIZE, height: 2, fill: "rgba(15,23,42,0.08)" }),
    baseRects.map(renderRect).join(""),
    face,
    extras,
    "</g>",
  ].join("");
}

function createFallbackSpriteSheet(speciesId: number, stage: Stage, animationState: TamagotchiAnimationState): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${GRID_SIZE * FRAME_COUNT}" height="${GRID_SIZE}" viewBox="0 0 ${GRID_SIZE * FRAME_COUNT} ${GRID_SIZE}" shape-rendering="crispEdges">`,
    `<rect width="100%" height="100%" fill="transparent" />`,
    Array.from({ length: FRAME_COUNT }, (_, frameIndex) => createDinoFrame(speciesId, stage, animationState, frameIndex)).join(""),
    "</svg>",
  ].join("");

  return svgToDataUri(svg);
}

function createFallbackEggSheet(seed: number): string {
  const variant = getEggVariantIndex(seed);
  const hue = (variant * 73) % 360;
  const shell = hsl(hue, 72, 78);
  const shellShadow = hsl(hue, 48, 64);
  const spots = hsl((hue + 40) % 360, 66, 58);
  const highlight = hsl((hue + 8) % 360, 90, 96);

  const frames = Array.from({ length: FRAME_COUNT }, (_, frameIndex) => {
    const wobble = [0, 1, 0, -1][frameIndex];
    const crackOpacity = frameIndex >= 2 ? 0.85 : 0.24;
    return [
      `<g transform="translate(${frameIndex * GRID_SIZE},0)">`,
      renderRect({ x: 0, y: GRID_SIZE - 2, width: GRID_SIZE, height: 2, fill: "rgba(91,33,182,0.1)" }),
      renderRect({ x: 5 + wobble, y: 2, width: 6, height: 11, fill: shell, rx: 2 }),
      renderRect({ x: 6 + wobble, y: 3, width: 4, height: 8, fill: highlight, opacity: 0.8, rx: 1 }),
      renderRect({ x: 4 + wobble, y: 5, width: 2, height: 2, fill: spots, opacity: 0.9 }),
      renderRect({ x: 9 + wobble, y: 7, width: 2, height: 2, fill: shellShadow, opacity: 0.9 }),
      renderRect({ x: 7 + wobble, y: 8, width: 1, height: 4, fill: "#8b5cf6", opacity: crackOpacity }),
      renderRect({ x: 8 + wobble, y: 9, width: 1, height: 2, fill: "#8b5cf6", opacity: crackOpacity }),
      "</g>",
    ].join("");
  }).join("");

  return svgToDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${GRID_SIZE * FRAME_COUNT}" height="${GRID_SIZE}" viewBox="0 0 ${GRID_SIZE * FRAME_COUNT} ${GRID_SIZE}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="transparent" />${frames}</svg>`
  );
}

export function getEggVariantIndex(seed: number): number {
  return (Math.abs(seed) % EGG_VARIANT_COUNT) + 1;
}

export function getEggVariantLabel(seed: number): string {
  return EGG_VARIANT_NAMES[getEggVariantIndex(seed) - 1];
}

export function getTamagotchiSpriteSheet(
  speciesId: number,
  stage: Stage,
  animationState: TamagotchiAnimationState
): SpriteDescriptor {
  return {
    expectedSrc: `/tamagotchi/${padId(speciesId)}/${stage}.png`,
    fallbackSrc: createFallbackSpriteSheet(speciesId, stage, animationState),
    frameCount: FRAME_COUNT,
    frameDurationMs: FRAME_DURATIONS[animationState],
    frameSizePx: GRID_SIZE,
    displaySizePx: 160,
  };
}

export function getTamagotchiEggSheet(seed: number): SpriteDescriptor {
  const variant = getEggVariantIndex(seed);
  return {
    expectedSrc: `/tamagotchi/eggs/variant-${variant}.png`,
    fallbackSrc: createFallbackEggSheet(seed),
    frameCount: FRAME_COUNT,
    frameDurationMs: 260,
    frameSizePx: GRID_SIZE,
    displaySizePx: 88,
  };
}
