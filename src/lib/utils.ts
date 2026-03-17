import type { Stage } from "./types";

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

const STAGE_DEX_ORDER: Stage[] = ["hatchling", "juvenile", "adult"];

export function getStageDexId(id: number, stage: Stage): number {
  const stageOffset = STAGE_DEX_ORDER.indexOf(stage);

  if (stageOffset === -1) {
    throw new Error(`Unsupported stage: ${stage}`);
  }

  return ((id - 1) * STAGE_DEX_ORDER.length) + stageOffset + 1;
}

export function formatStageDexNumber(id: number, stage: Stage): string {
  return `#${String(getStageDexId(id, stage)).padStart(2, "0")}`;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`;
  return `${kg.toFixed(0)}kg`;
}

export function formatMeters(m: number): string {
  if (m < 1) return `${(m * 100).toFixed(0)}cm`;
  return `${m.toFixed(1)}m`;
}

export function formatSpeed(kmh: number): string {
  return `${kmh}km/h`;
}

export function getStatPercent(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

export function getArtPath(id: number, stage: Stage, size: "full" | "thumb" = "full"): string {
  const paddedId = String(id).padStart(3, "0");
  const suffix = size === "thumb" ? "-thumb" : "";
  return `/dinos/${paddedId}/${stage}${suffix}.webp`;
}

export function getPlaceholderArtPath(stage: Stage): string {
  return `/dinos/placeholder-${stage}.svg`;
}

export function shouldAttemptArtRecovery(currentArtSrc: string, fallbackArtSrc: string): boolean {
  return currentArtSrc === fallbackArtSrc;
}

export function getArtRecoveryProbeSrc(expectedArtSrc: string, recoveryToken: string): string {
  const separator = expectedArtSrc.includes("?") ? "&" : "?";
  return `${expectedArtSrc}${separator}art-retry=${encodeURIComponent(recoveryToken)}`;
}
