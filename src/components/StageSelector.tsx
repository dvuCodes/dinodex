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
    <div className="flex gap-2">
      {STAGES.map(({ key, label }) => {
        const isActive = activeStage === key;
        const colors = STAGE_COLORS[key];

        return (
          <motion.button
            key={key}
            onClick={() => onStageChange(key)}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-4 rounded-pill font-body text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            style={
              isActive
                ? {
                    backgroundColor: colors.primary,
                    color: "white",
                    boxShadow: `0 2px 8px ${colors.primary}40`,
                  }
                : {
                    border: `1px solid ${colors.primary}`,
                    color: colors.primary,
                    backgroundColor: "transparent",
                  }
            }
            aria-label={`View ${key} stage`}
            aria-pressed={isActive}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
