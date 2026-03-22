"use client";

import { motion } from "framer-motion";
import type { TamagotchiStats } from "@/lib/tamagotchi";

const STAT_CONFIG = [
  { key: "hunger" as const, label: "Hunger", emoji: "🍖", color: "#F97316" },
  { key: "happiness" as const, label: "Happiness", emoji: "😊", color: "#8B5CF6" },
  { key: "energy" as const, label: "Energy", emoji: "⚡", color: "#3B82F6" },
];

function getBarColor(value: number, baseColor: string): string {
  if (value < 20) return "#EF4444";
  if (value < 40) return "#F59E0B";
  return baseColor;
}

interface StatBarsProps {
  stats: TamagotchiStats;
}

export function StatBars({ stats }: StatBarsProps) {
  return (
    <div className="space-y-3">
      {STAT_CONFIG.map((stat, i) => {
        const value = stats[stat.key];
        const barColor = getBarColor(value, stat.color);

        return (
          <div key={stat.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-xs text-text-secondary flex items-center gap-1.5">
                <span aria-hidden="true">{stat.emoji}</span>
                {stat.label}
              </span>
              <span className="font-mono text-xs text-text-muted">{value}%</span>
            </div>
            <div className="h-3 rounded-pill bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-pill relative"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 shimmer rounded-pill"
                  style={{ opacity: value > 70 ? 0.3 : 0 }}
                />
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
