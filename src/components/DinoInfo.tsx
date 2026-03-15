"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { DIET_COLORS, ERA_COLORS } from "@/lib/constants";

interface DinoInfoProps {
  dino: DinoEntry;
  stage: Stage;
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-border-default/60 last:border-b-0">
      <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span
        className="font-body text-[13px] font-medium text-right"
        style={{ color: accent || "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function DinoInfo({ dino, stage }: DinoInfoProps) {
  const stageData = dino.stages[stage];
  const dietInfo = DIET_COLORS[dino.diet];
  const eraColor = ERA_COLORS[dino.era];

  return (
    <div className="flex flex-col gap-4">
      {/* Info card with era accent */}
      <div
        className="bg-white rounded-card p-4 shadow-sm border border-border-default overflow-hidden relative"
      >
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: eraColor.primary }}
        />
        <h3 className="font-display text-sm font-bold text-text-primary mb-2 pl-3">
          Classification
        </h3>
        <div className="pl-3">
          <InfoRow label="Era" value={dino.period} accent={eraColor.primary} />
          <InfoRow label="Region" value={dino.region} />
          <InfoRow label="Type" value={dino.type} />
          <InfoRow
            label="Diet"
            value={`${dietInfo.emoji} ${dino.diet.charAt(0).toUpperCase() + dino.diet.slice(1)}`}
            accent={dietInfo.primary}
          />
          <InfoRow label="Movement" value={dino.locomotion.charAt(0).toUpperCase() + dino.locomotion.slice(1)} />
          <InfoRow
            label="Discovered"
            value={`${dino.discoveredBy}, ${dino.discoveredYear}`}
          />
        </div>
      </div>

      {/* Stage description with crossfade */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-border-default relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.04]"
          style={{
            background: `radial-gradient(circle, ${eraColor.primary}, transparent 70%)`,
          }}
        />
        <h3 className="font-display text-sm font-bold text-text-primary mb-2">
          About this stage
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-body text-sm text-text-secondary leading-relaxed">
              {stageData.description}
            </p>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-parchment">
              <span className="text-sm">{dietInfo.emoji}</span>
              <span className="font-body text-xs text-text-muted">
                <span className="font-medium text-text-secondary">Diet:</span> {stageData.dietDescription}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fun fact — distinctive treatment */}
      <div
        className="rounded-card p-4 shadow-sm border-2 relative overflow-hidden"
        style={{
          borderColor: `${eraColor.primary}30`,
          background: `linear-gradient(135deg, ${eraColor.light}40, white 60%)`,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">💡</span>
          <div>
            <h3 className="font-display text-sm font-bold text-text-primary mb-1">
              Fun Fact
            </h3>
            <p className="font-body text-sm text-text-secondary leading-relaxed">
              {dino.funFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
