"use client";

import type { DinoStage } from "@/lib/types";
import { STAT_MAXES, STAT_COLORS } from "@/lib/constants";
import { formatMeters, formatWeight, formatSpeed } from "@/lib/utils";
import { SegmentedStatBar } from "./SegmentedStatBar";

interface StatsPanelProps {
  stage: DinoStage;
  animationKey: string;
}

export function StatsPanel({ stage, animationKey }: StatsPanelProps) {
  const stats = [
    {
      label: "Height",
      value: stage.height,
      max: STAT_MAXES.height,
      color: STAT_COLORS.height,
      unit: formatMeters(stage.height),
    },
    {
      label: "Length",
      value: stage.length,
      max: STAT_MAXES.length,
      color: STAT_COLORS.length,
      unit: formatMeters(stage.length),
    },
    {
      label: "Weight",
      value: stage.weight,
      max: STAT_MAXES.weight,
      color: STAT_COLORS.weight,
      unit: formatWeight(stage.weight),
    },
    {
      label: "Speed",
      value: stage.speed,
      max: STAT_MAXES.speed,
      color: STAT_COLORS.speed,
      unit: formatSpeed(stage.speed),
    },
    {
      label: "Danger",
      value: stage.danger,
      max: STAT_MAXES.danger,
      color: STAT_COLORS.danger,
      unit: `${stage.danger}/10`,
    },
    {
      label: "Defense",
      value: stage.defense,
      max: STAT_MAXES.defense,
      color: STAT_COLORS.defense,
      unit: `${stage.defense}/10`,
    },
  ];

  return (
    <div key={animationKey} className="flex flex-col gap-3">
      {stats.map((stat, i) => (
        <SegmentedStatBar
          key={stat.label}
          label={stat.label}
          value={stat.value}
          max={stat.max}
          color={stat.color}
          unit={stat.unit}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
