"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { TamagotchiStage, Mood, TamagotchiAction } from "@/lib/tamagotchi";
import { getActionFeedbackKey, getMoodEmoji } from "@/lib/tamagotchi";
import { TAMAGOTCHI_STAGE_COLORS, ERA_COLORS } from "@/lib/constants";
import type { Era } from "@/lib/types";

interface DinoAvatarProps {
  dinoName: string;
  stage: TamagotchiStage;
  mood: Mood;
  era: Era;
  lastAction: string | null;
  lastActionTime: number;
}

const STAGE_EMOJI: Record<TamagotchiStage, string> = {
  egg: "🥚",
  hatchling: "🐣",
  juvenile: "🦕",
  adult: "🦖",
};

export function DinoAvatar({ dinoName, stage, mood, era, lastAction, lastActionTime }: DinoAvatarProps) {
  const reduceMotion = useReducedMotion();
  const stageColor = TAMAGOTCHI_STAGE_COLORS[stage];
  const eraColor = ERA_COLORS[era];
  const isEgg = stage === "egg";

  return (
    <div
      className="relative aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${eraColor.light}, ${stageColor.bg})`,
      }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 dex-scanline pointer-events-none" />

      {/* Dino silhouette */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${stage}-${mood}`}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: isEgg ? [0, -4, 0] : mood === "ecstatic" ? [0, -10, 0] : mood === "happy" ? [0, -5, 0] : 0,
                  rotate: isEgg ? [-3, 3, -2, 2, -3] : 0,
                }
          }
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.4, type: "spring" },
            y: reduceMotion ? { duration: 0 } : { duration: isEgg ? 3 : 2, repeat: Infinity, ease: "easeInOut" },
            rotate: reduceMotion || !isEgg ? undefined : { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="text-[120px] sm:text-[150px] select-none"
            style={{ filter: !isEgg && mood === "critical" ? "grayscale(0.5)" : "none" }}
          >
            {STAGE_EMOJI[stage]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Mood indicator (hidden for eggs) */}
      {!isEgg && (
        <motion.div
          key={mood}
          initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
          className="absolute top-4 right-4 text-3xl"
          aria-label={`Mood: ${mood}`}
        >
          {getMoodEmoji(mood)}
        </motion.div>
      )}

      {/* Stage badge */}
      <div
        className="absolute bottom-4 left-4 px-3 py-1 rounded-pill font-mono text-xs uppercase tracking-wider text-white"
        style={{ backgroundColor: stageColor.primary }}
      >
        {stageColor.emoji} {stage}
      </div>

      {/* Action feedback */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            key={getActionFeedbackKey(lastAction as TamagotchiAction, lastActionTime)}
            initial={reduceMotion ? false : { opacity: 1, y: 0, scale: 1 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -40, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 font-display font-bold text-lg text-white drop-shadow-lg pointer-events-none"
          >
            {lastAction === "feed" ? "🍖" : lastAction === "play" ? "🎮" : "💤"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
