"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TamagotchiStats } from "@/lib/tamagotchi";

const STAT_CONFIG: { key: keyof TamagotchiStats; label: string; emoji: string; color: string }[] = [
  { key: "hunger", label: "Hunger", emoji: "🍖", color: "#F97316" },
  { key: "happiness", label: "Joy", emoji: "🎈", color: "#A855F7" },
  { key: "energy", label: "Energy", emoji: "⚡", color: "#3B82F6" },
  { key: "cleanliness", label: "Clean", emoji: "🧼", color: "#14B8A6" },
  { key: "health", label: "Health", emoji: "💗", color: "#EF4444" },
  { key: "discipline", label: "Discipline", emoji: "📣", color: "#E11D48" },
];

function toneForValue(value: number, color: string) {
  if (value < 25) return "#DC2626";
  if (value < 45) return "#D97706";
  return color;
}

interface StatBarsProps {
  stats: TamagotchiStats;
}

export function StatBars({ stats }: StatBarsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {STAT_CONFIG.map((stat, index) => {
        const value = stats[stat.key];
        const barColor = toneForValue(value, stat.color);

        return (
          <div key={stat.key} className="rounded-2xl border border-border-default/80 bg-white/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-body text-xs font-medium text-text-secondary">
                <span aria-hidden="true">{stat.emoji}</span>
                {stat.label}
              </span>
              <span className="font-mono text-xs text-text-muted">{value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-pill bg-stone-100">
              <motion.div
                className="relative h-full rounded-pill"
                style={{ backgroundColor: barColor }}
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${value}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, delay: index * 0.04, type: "spring", stiffness: 130, damping: 18 }
                }
              >
                <div className="absolute inset-0 shimmer rounded-pill" style={{ opacity: value > 70 ? 0.22 : 0 }} />
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
