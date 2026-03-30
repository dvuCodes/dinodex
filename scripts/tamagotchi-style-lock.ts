import type { Era, Stage } from "../src/lib/types";
import type { TamagotchiAnimationState } from "../src/lib/tamagotchi";
import { padTamagotchiId } from "./tamagotchi-art-pipeline";

export const STYLE_LOCK_REFERENCE_SPECIES = [1, 2] as const;
export const STYLE_LOCK_STYLE_FAMILY = "001-002";
export const STYLE_LOCK_STAGES: Stage[] = ["hatchling", "juvenile", "adult"];
export const STYLE_LOCK_MOODS: TamagotchiAnimationState[] = ["idle", "happy", "sleepy", "sick"];

export type AnimatedApprovalMetadata = {
  animationApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
};

export function hasExplicitAnimatedApproval(metadata: unknown): metadata is AnimatedApprovalMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "animationApproved" in metadata &&
    typeof metadata.animationApproved === "boolean"
  );
}

type SpeciesPromptOptions = {
  id: number;
  name: string;
  era: Era;
};

export function buildStyleLockPromptBlock(): string {
  return [
    `Style-lock family: #${padTamagotchiId(STYLE_LOCK_REFERENCE_SPECIES[0])} + #${padTamagotchiId(STYLE_LOCK_REFERENCE_SPECIES[1])} (${STYLE_LOCK_STYLE_FAMILY}).`,
    "Match the approved Tamagotchi silhouette language, readable pixel-cluster shapes, and handheld-scale clarity.",
    "Output as clean pixel art on a PURE SOLID WHITE background only.",
  ].join("\n");
}

export function buildSpeciesPromptBlock({ id, name, era }: SpeciesPromptOptions): string {
  return [
    `Species target: #${padTamagotchiId(id)} ${name}.`,
    `Era: ${era}.`,
    "Keep the species-specific anatomy and proportions distinct within the shared family style.",
  ].join("\n");
}

export function isAnimatedSpeciesApproved(metadata: AnimatedApprovalMetadata | null | undefined): boolean {
  return metadata?.animationApproved === true;
}
