"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TamagotchiAction } from "@/lib/tamagotchi";
import { Button } from "@/components/ui/Button";

const PRIMARY_ACTIONS: { action: TamagotchiAction; emoji: string; label: string; color: string }[] = [
  { action: "feed", emoji: "🍖", label: "Feed", color: "#F97316" },
  { action: "play", emoji: "🎮", label: "Play", color: "#8B5CF6" },
  { action: "clean", emoji: "🧼", label: "Clean", color: "#14B8A6" },
  { action: "medicine", emoji: "💊", label: "Medicine", color: "#EF4444" },
  { action: "lights", emoji: "💡", label: "Lights", color: "#3B82F6" },
  { action: "discipline", emoji: "📣", label: "Discipline", color: "#E11D48" },
];

const SECONDARY_ACTIONS: { action: TamagotchiAction; emoji: string; label: string }[] = [
  { action: "snack", emoji: "🍪", label: "Snack" },
  { action: "status", emoji: "📟", label: "Status" },
];

interface ActionButtonsProps {
  disabled: boolean;
  isEgg: boolean;
  onAction: (action: TamagotchiAction) => void;
}

export function ActionButtons({ disabled, isEgg, onAction }: ActionButtonsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {PRIMARY_ACTIONS.map((item, index) => (
          <motion.button
            key={item.action}
            type="button"
            aria-label={item.label}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.1 + index * 0.04 }}
            whileHover={
              reduceMotion || disabled || isEgg
                ? undefined
                : {
                    y: -3,
                    scale: 1.03,
                    boxShadow: `0 18px 30px ${item.color}26`,
                  }
            }
            whileTap={reduceMotion || disabled || isEgg ? undefined : { scale: 0.96 }}
            onClick={() => onAction(item.action)}
            disabled={disabled || isEgg}
            className="group rounded-[1.4rem] border-2 bg-white px-3 py-4 text-left shadow-[0_10px_24px_rgba(28,25,23,0.08)] transition-[transform,box-shadow,border-color,background-color] motion-reduce:transform-none motion-reduce:transition-none hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              borderColor: `${item.color}40`,
              boxShadow:
                disabled || isEgg
                  ? "0 10px 24px rgba(28,25,23,0.08)"
                  : `0 10px 24px rgba(28,25,23,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
            }}
          >
            <span className="mb-2 block text-3xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="block font-display text-sm font-bold" style={{ color: item.color }}>
              {item.label}
            </span>
            <span className="mt-1 block font-body text-[11px] text-text-muted">
              {isEgg ? "Locked until hatch" : "Care action"}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SECONDARY_ACTIONS.map((item) => (
          <Button
            key={item.action}
            aria-label={item.label}
            onClick={() => onAction(item.action)}
            disabled={disabled || isEgg}
            variant="outline"
            size="md"
            className="justify-start bg-white/82"
          >
            <span aria-hidden="true" className="mr-2">
              {item.emoji}
            </span>
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
