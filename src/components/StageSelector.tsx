"use client";

import { motion } from "framer-motion";
import type { Stage } from "@/lib/types";
import { STAGE_COLORS } from "@/lib/constants";

interface StageSelectorProps {
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
}

const STAGES: { key: Stage; label: string }[] = [
  { key: "hatchling", label: "🥚 Hatchling" },
  { key: "juvenile", label: "⚡ Juvenile" },
  { key: "adult", label: "🔥 Adult" },
];

export function StageSelector({
  activeStage,
  onStageChange,
}: StageSelectorProps) {
  return (
    <div className="relative inline-flex gap-1 p-1 rounded-pill bg-parchment border border-border-default">
      {STAGES.map(({ key, label }) => {
        const isActive = activeStage === key;
        const colors = STAGE_COLORS[key];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStageChange(key)}
            className={`relative z-10 h-9 rounded-pill px-4 font-body text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
              isActive
                ? ""
                : "hover:-translate-y-px hover:bg-white/70 hover:shadow-sm focus-visible:-translate-y-px focus-visible:bg-white/70 focus-visible:shadow-sm"
            }`}
            style={{
              color: isActive ? "white" : colors.primary,
            }}
            aria-label={`View ${key} stage`}
            aria-pressed={isActive}
          >
            {/* Sliding active background */}
            {isActive && (
              <motion.div
                layoutId="stage-active-bg"
                className="absolute inset-0 rounded-pill"
                style={{
                  backgroundColor: colors.primary,
                  boxShadow: `0 2px 12px ${colors.primary}40`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
