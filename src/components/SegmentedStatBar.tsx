"use client";

import { motion } from "framer-motion";

interface SegmentedStatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
  delay?: number;
}

const TOTAL_SEGMENTS = 15;

export function SegmentedStatBar({
  label,
  value,
  max,
  color,
  unit,
  delay = 0,
}: SegmentedStatBarProps) {
  const percent = Math.min(100, (value / max) * 100);
  const filledCount = Math.round((percent / 100) * TOTAL_SEGMENTS);

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-[13px] font-medium text-text-secondary w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-[2px]" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${unit}`}>
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
          const isFilled = i < filledCount;
          return (
            <motion.div
              key={i}
              className="flex-1 h-3.5 rounded-[2px]"
              style={{
                backgroundColor: isFilled ? color : "#F1F0EB",
              }}
              initial={{ scaleY: 0.3, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: delay + i * 0.025,
              }}
            />
          );
        })}
      </div>
      <span className="font-mono text-[13px] font-medium text-text-primary w-16 text-right shrink-0 tabular-nums">
        {unit}
      </span>
    </div>
  );
}
