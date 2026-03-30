"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import { ERA_COLORS, TAMAGOTCHI_STAGE_COLORS } from "@/lib/constants";
import type {
  AttentionReason,
  Mood,
  TamagotchiAction,
  TamagotchiAnimationState,
  TamagotchiStage,
} from "@/lib/tamagotchi";
import { getMoodEmoji } from "@/lib/tamagotchi";
import type { Era } from "@/lib/types";
import { getEggVariantLabel, getTamagotchiEggSheet, getTamagotchiSpriteSheet } from "@/lib/tamagotchi-sprites";
import { PixelSprite } from "./PixelSprite";

interface DinoAvatarProps {
  attentionReason: AttentionReason | null;
  animationState: TamagotchiAnimationState;
  dinoId: number;
  dinoName: string;
  eggProgress: number;
  eggVariantSeed: number;
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

export function DinoAvatar({
  attentionReason,
  animationState,
  dinoId,
  dinoName,
  eggProgress,
  eggVariantSeed,
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
  const spriteDescriptor =
    stage === "egg"
      ? getTamagotchiEggSheet(dinoId, eggVariantSeed)
      : getTamagotchiSpriteSheet(dinoId, stage, animationState);
  const { artSrc, usingFallback } = useArtSource(spriteDescriptor.expectedSrc, spriteDescriptor.fallbackSrc);
  const crackCount = eggProgress > 90 ? 3 : eggProgress > 72 ? 2 : eggProgress > 48 ? 1 : 0;
  const usesPrototypeStripMotion = stage !== "egg" && spriteDescriptor.expectedFrameCount > 1;

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
        <div className="absolute inset-[14px] rounded-[1.2rem] border border-[#d7e2f3] bg-[linear-gradient(180deg,#f4ffea_0%,#d7f2c1_100%)] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.55)]" />

        <div className="relative mb-3 flex items-center justify-between gap-3">
          <span className="rounded-sm border border-black/20 bg-black/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-white shadow-[2px_2px_0_rgba(255,255,255,0.16)]">
            {stage === "egg" ? `${getEggVariantLabel(eggVariantSeed)} egg` : `${stage} ${animationState}`}
          </span>
          <span className="text-2xl" aria-label={`Mood: ${mood}`}>
            {getMoodEmoji(mood)}
          </span>
        </div>

        <motion.div
          animate={
            reduceMotion
              ? { y: 0 }
              : usesPrototypeStripMotion
                ? { y: 0 }
                : {
                    y: sleeping ? [0, 2, 0] : mood === "ecstatic" ? [0, -8, 0] : mood === "happy" ? [0, -4, 0] : [0, 0, 0],
                  }
          }
          transition={
            reduceMotion || usesPrototypeStripMotion
              ? { duration: 0 }
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative mx-auto flex aspect-square max-w-[280px] items-center justify-center"
        >
          <PixelSprite
            key={`${artSrc}-${usingFallback ? spriteDescriptor.fallbackFrameCount : spriteDescriptor.expectedFrameCount}-${spriteDescriptor.displaySizePx}`}
            ariaLabel={stage === "egg" ? `${dinoName} egg in tamagotchi mode` : `${dinoName} pixel sprite in tamagotchi mode`}
            artSrc={artSrc}
            displaySizePx={spriteDescriptor.displaySizePx}
            frameCount={usingFallback ? spriteDescriptor.fallbackFrameCount : spriteDescriptor.expectedFrameCount}
            frameDurationMs={spriteDescriptor.frameDurationMs}
            reduceMotion={reduceMotion}
          />

          {stage === "egg" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[160px] w-[160px]">
                {Array.from({ length: crackCount }, (_, index) => (
                  <span
                    key={index}
                    className="absolute block h-7 w-[3px] rounded-full bg-violet-700/70"
                    style={{
                      left: `${72 + index * 8}px`,
                      top: `${42 + index * 10}px`,
                      rotate: `${index % 2 === 0 ? -28 : 18}deg`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {poopCount > 0 ? (
            <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
              {Array.from({ length: Math.min(poopCount, 3) }, (_, index) => (
                <span
                  key={index}
                  className="block h-4 w-4 rounded-sm border border-stone-900/20 bg-stone-700 shadow-[2px_2px_0_rgba(255,255,255,0.18)]"
                />
              ))}
            </div>
          ) : null}

          {attentionReason ? (
            <span className="absolute right-6 top-4 rounded-sm border border-[#7f1d1d] bg-[#fee2e2] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7f1d1d]">
              {attentionReason}
            </span>
          ) : null}
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
