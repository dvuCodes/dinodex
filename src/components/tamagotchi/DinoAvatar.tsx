"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import { ERA_COLORS, TAMAGOTCHI_STAGE_COLORS } from "@/lib/constants";
import { getMoodEmoji, type AttentionReason, type Mood, type TamagotchiAction, type TamagotchiStage } from "@/lib/tamagotchi";
import type { Era, Stage } from "@/lib/types";
import { getArtPath, getPlaceholderArtPath } from "@/lib/utils";

interface DinoAvatarProps {
  attentionReason: AttentionReason | null;
  dinoId: number;
  dinoName: string;
  era: Era;
  lastAction: TamagotchiAction | null;
  mood: Mood;
  poopCount: number;
  sick: boolean;
  sleeping: boolean;
  stage: TamagotchiStage;
}

const ACTION_BADGES: Partial<Record<TamagotchiAction, string>> = {
  feed: "Meal served",
  snack: "Treat time",
  play: "Play burst",
  clean: "Freshened up",
  medicine: "Medicine given",
  lights: "Lights toggled",
  discipline: "Discipline",
  status: "Vitals check",
};

function toArtStage(stage: TamagotchiStage): Stage {
  if (stage === "egg") {
    return "hatchling";
  }

  return stage;
}

export function DinoAvatar({
  attentionReason,
  dinoId,
  dinoName,
  era,
  lastAction,
  mood,
  poopCount,
  sick,
  sleeping,
  stage,
}: DinoAvatarProps) {
  const reduceMotion = useReducedMotion();
  const stageColor = TAMAGOTCHI_STAGE_COLORS[stage];
  const eraColor = ERA_COLORS[era];
  const artStage = toArtStage(stage);
  const expectedArtSrc = getArtPath(dinoId, artStage);
  const fallbackArtSrc = getPlaceholderArtPath(artStage);
  const { artSrc, handleArtError } = useArtSource(expectedArtSrc, fallbackArtSrc);

  const statusChips = [
    { label: sleeping ? "Sleep: On" : "Sleep: Awake", active: sleeping },
    { label: sick ? "Sick: Yes" : "Sick: No", active: sick },
    { label: poopCount > 0 ? `Mess: ${poopCount}` : "Mess: Clear", active: poopCount > 0 },
    { label: attentionReason ? `Attention: ${attentionReason}` : "Attention: Calm", active: Boolean(attentionReason) },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-[0_30px_70px_rgba(28,25,23,0.16)]"
      style={{
        background: `linear-gradient(155deg, ${eraColor.dark} 0%, ${eraColor.primary} 28%, ${stageColor.bg} 100%)`,
      }}
    >
      <div className="absolute inset-x-6 top-4 h-1 rounded-full bg-white/25" />
      <div className="absolute inset-4 rounded-[1.5rem] border border-white/20 bg-black/12" />

      <div className="relative rounded-[1.5rem] border border-white/60 bg-[#f6f8fb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="absolute inset-0 rounded-[1.5rem] dex-scanline opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-[1.5rem] bg-gradient-to-b from-white/75 to-transparent" />

        <div className="relative mb-3 flex items-center justify-between gap-3">
          <span className="rounded-pill bg-black/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-white">
            {stage}
          </span>
          <span className="text-2xl" aria-label={`Mood: ${mood}`}>
            {getMoodEmoji(mood)}
          </span>
        </div>

        <motion.div
          animate={
            reduceMotion
              ? { y: 0 }
              : {
                  y: sleeping ? [0, 2, 0] : mood === "ecstatic" ? [0, -8, 0] : mood === "happy" ? [0, -4, 0] : [0, 0, 0],
                }
          }
          transition={reduceMotion ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto aspect-square max-w-[280px]"
        >
          {stage === "egg" ? (
            <div className="flex h-full items-center justify-center text-[9rem] drop-shadow-[0_16px_36px_rgba(124,58,237,0.28)]">
              🥚
            </div>
          ) : (
            <Image
              src={artSrc}
              alt={`${dinoName} in tamagotchi mode`}
              fill
              unoptimized
              sizes="(max-width: 640px) 70vw, 280px"
              className="object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.26)]"
              onError={handleArtError}
            />
          )}
        </motion.div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {statusChips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-pill px-2.5 py-1 font-body text-[11px] ${
                chip.active ? "bg-accent text-white" : "bg-stone-900/8 text-text-secondary"
              }`}
            >
              {chip.label}
            </span>
          ))}
        </div>

        {lastAction ? (
          <div className="relative mt-3 rounded-2xl bg-stone-950/90 px-3 py-2 font-body text-xs text-white">
            {ACTION_BADGES[lastAction] ?? "Action taken"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
