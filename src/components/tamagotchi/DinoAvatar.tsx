"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Stage } from "@/lib/types";
import type { Mood } from "@/lib/tamagotchi";
import { getMoodEmoji } from "@/lib/tamagotchi";
import { STAGE_COLORS, ERA_COLORS } from "@/lib/constants";
import type { Era } from "@/lib/types";

interface DinoAvatarProps {
  dinoName: string;
  stage: Stage;
  mood: Mood;
  era: Era;
  lastAction: string | null;
}

const STAGE_EMOJI: Record<Stage, string> = {
  hatchling: "🥚",
  juvenile: "🦕",
  adult: "🦖",
};

export function DinoAvatar({ dinoName, stage, mood, era, lastAction }: DinoAvatarProps) {
  const stageColor = STAGE_COLORS[stage];
  const eraColor = ERA_COLORS[era];

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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: mood === "ecstatic" ? [0, -10, 0] : mood === "happy" ? [0, -5, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.4, type: "spring" },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="text-[120px] sm:text-[150px] select-none"
            style={{ filter: mood === "critical" ? "grayscale(0.5)" : "none" }}
          >
            {STAGE_EMOJI[stage]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Mood indicator */}
      <motion.div
        key={mood}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute top-4 right-4 text-3xl"
        aria-label={`Mood: ${mood}`}
      >
        {getMoodEmoji(mood)}
      </motion.div>

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
            key={lastAction + Date.now()}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 font-display font-bold text-lg text-white drop-shadow-lg pointer-events-none"
          >
            {lastAction === "feed" ? "🍖" : lastAction === "play" ? "🎮" : "💤"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
