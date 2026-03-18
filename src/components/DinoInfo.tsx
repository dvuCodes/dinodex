"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { DIET_COLORS, ERA_COLORS } from "@/lib/constants";
import { InfoGrid } from "./InfoGrid";

interface DinoInfoProps {
  dino: DinoEntry;
  stage: Stage;
}

export function DinoInfo({ dino, stage }: DinoInfoProps) {
  const stageData = dino.stages[stage];
  const dietInfo = DIET_COLORS[dino.diet];
  const eraColor = ERA_COLORS[dino.era];

  return (
    <div className="flex flex-col gap-4">
      {/* Classification grid */}
      <InfoGrid dino={dino} eraColor={eraColor.primary} />

      {/* Stage description with crossfade */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-border-default relative overflow-hidden">
        {/* Decorative quote mark */}
        <span
          className="absolute -top-2 -left-1 font-display text-[80px] font-black leading-none select-none pointer-events-none"
          style={{ color: `${eraColor.primary}08` }}
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <h3 className="font-display text-sm font-bold text-text-primary mb-2 relative">
          About this stage
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
          >
            <p className="font-body text-sm text-text-secondary leading-relaxed relative">
              {stageData.description}
            </p>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-parchment">
              <span className="text-sm" aria-hidden="true">{dietInfo.emoji}</span>
              <span className="font-body text-xs text-text-muted">
                <span className="font-medium text-text-secondary">Diet:</span> {stageData.dietDescription}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fun fact */}
      <div
        className="rounded-card p-4 shadow-sm border-2 relative overflow-hidden"
        style={{
          borderColor: `${eraColor.primary}30`,
          background: `linear-gradient(135deg, ${eraColor.light}50, white 50%)`,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">💡</span>
          <div>
            <h3 className="font-display text-sm font-bold text-text-primary mb-1">
              Fun Fact
            </h3>
            <p className="font-body text-[15px] text-text-secondary leading-relaxed">
              {dino.funFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
