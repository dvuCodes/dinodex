import type { Stage } from "./types";

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
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

export function getArtPath(id: number, stage: Stage): string {
  const paddedId = String(id).padStart(3, "0");
  return `/dinos/${paddedId}/${stage}.webp`;
}
