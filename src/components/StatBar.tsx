"use client";

import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
  delay?: number;
}

export function StatBar({
  label,
  value,
  max,
  color,
  unit,
  delay = 0,
}: StatBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-[13px] font-medium text-text-secondary w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-3 rounded-pill bg-parchment border border-border-default/50 overflow-hidden">
        <motion.div
          className="h-full rounded-pill relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay,
          }}
        >
          {/* Subtle shimmer on the filled portion */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)`,
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
      </div>
      <span className="font-mono text-[13px] font-medium text-text-primary w-16 text-right shrink-0 tabular-nums">
        {unit}
      </span>
    </div>
  );
}
