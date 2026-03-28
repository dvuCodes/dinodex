"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TamagotchiAction } from "@/lib/tamagotchi";

const ACTIONS: { action: TamagotchiAction; emoji: string; label: string; color: string }[] = [
  { action: "feed", emoji: "🍖", label: "Feed", color: "#F97316" },
  { action: "play", emoji: "🎮", label: "Play", color: "#8B5CF6" },
  { action: "sleep", emoji: "😴", label: "Sleep", color: "#3B82F6" },
];

interface ActionButtonsProps {
  onAction: (action: TamagotchiAction) => void;
  disabled: boolean;
}

export function ActionButtons({ onAction, disabled }: ActionButtonsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map((item, i) => (
        <motion.button
          key={item.action}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.3 + i * 0.1 }}
          whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          onClick={() => onAction(item.action)}
          disabled={disabled}
          className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl bg-white border-2 shadow-sm hover:shadow-md transition-[transform,box-shadow,border-color] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            borderColor: `${item.color}30`,
          }}
        >
          <span className="text-3xl">{item.emoji}</span>
          <span
            className="font-display font-bold text-sm"
            style={{ color: item.color }}
          >
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
