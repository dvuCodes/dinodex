import { join } from "node:path";
import type { Stage } from "../src/lib/types";

const RAW_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function padDinoId(id: number): string {
  return String(id).padStart(3, "0");
}

export function getTransparentOutputPath(projectRoot: string, dinoId: number, stage: Stage): string {
  return normalizePath(join(projectRoot, "scripts", "transparent-output", padDinoId(dinoId), `${stage}.png`));
}

export function getRawOutputPath(
  projectRoot: string,
  dinoId: number,
  stage: Stage,
  extension: (typeof RAW_EXTENSIONS)[number]
): string {
  return normalizePath(join(projectRoot, "scripts", "raw-output", padDinoId(dinoId), `${stage}.${extension}`));
}

export function findPreferredArtSourcePath(
  projectRoot: string,
  dinoId: number,
  stage: Stage,
  exists: (candidate: string) => boolean
): string | null {
  const transparentOutputPath = getTransparentOutputPath(projectRoot, dinoId, stage);
  if (exists(transparentOutputPath)) {
    return transparentOutputPath;
  }

  for (const extension of RAW_EXTENSIONS) {
    const rawOutputPath = getRawOutputPath(projectRoot, dinoId, stage, extension);
    if (exists(rawOutputPath)) {
      return rawOutputPath;
    }
  }

  return null;
}

