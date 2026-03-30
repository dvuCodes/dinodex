"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { Stage } from "@/lib/types";
import { STAGE_COLORS } from "@/lib/constants";
import { formatStageDexNumber, getArtPath, getPlaceholderArtPath } from "@/lib/utils";

interface StageEvolutionProps {
  dinoId: number;
  dinoName: string;
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
}

const STAGES: { key: Stage; label: string; shortLabel: string }[] = [
  { key: "hatchling", label: "Hatchling", shortLabel: "Hatch" },
  { key: "juvenile", label: "Juvenile", shortLabel: "Juv" },
  { key: "adult", label: "Adult", shortLabel: "Adult" },
];

function StagePortrait({
  dinoId,
  dinoName,
  stage,
  isActive,
  onClick,
}: {
  dinoId: number;
  dinoName: string;
  stage: Stage;
  isActive: boolean;
  onClick: () => void;
}) {
  const expectedSrc = getArtPath(dinoId, stage, "thumb");
  const fallbackSrc = getPlaceholderArtPath(stage);
  const { artSrc, handleArtError } = useArtSource(expectedSrc, fallbackSrc);
  const colors = STAGE_COLORS[stage];

  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={isActive}
      aria-label={`View ${stage} stage`}
      className="group flex flex-col items-center gap-1.5 rounded-[1.5rem] px-1 py-1 focus-visible:outline-none"
    >
      <div className="relative">
        {/* Active ring indicator */}
        {isActive && (
          <motion.div
            layoutId="stage-ring"
            className="absolute -inset-1.5 rounded-full"
            style={{
              border: `3px solid ${colors.primary}`,
              boxShadow: `0 0 16px ${colors.primary}40`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}

        {/* Focus ring */}
        <div className="absolute -inset-1.5 rounded-full ring-0 transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-accent/50 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-parchment" />

        {/* Portrait circle */}
        <motion.div
          animate={{ scale: isActive ? 1.1 : 1 }}
          whileHover={isActive ? undefined : { scale: 1.06, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative h-16 w-16 overflow-hidden rounded-full border-2 transition-[border-color,box-shadow,background-color] duration-200 group-focus-visible:shadow-[0_0_0_4px_rgba(118,92,72,0.12)] md:h-20 md:w-20"
          style={{
            borderColor: isActive ? "transparent" : colors.primary,
            background: isActive
              ? `linear-gradient(135deg, ${colors.bg}, white)`
              : `linear-gradient(135deg, ${colors.bg}55, var(--color-parchment))`,
            boxShadow: isActive ? undefined : `0 0 0 1px ${colors.primary}20`,
          }}
        >
          <Image
            src={artSrc}
            alt={`${stage} ${dinoName}`}
            width={128}
            height={128}
            unoptimized
            sizes="80px"
            className="h-full w-full object-contain p-1 transition-opacity duration-200"
            style={{ opacity: isActive ? 1 : 0.72 }}
            onError={handleArtError}
          />
        </motion.div>
      </div>

      {/* Stage label */}
      <div className="text-center">
        <p
          className="font-mono text-[10px] tracking-wider transition-colors duration-200"
          style={{ color: isActive ? colors.primary : `${colors.primary}CC` }}
        >
          {formatStageDexNumber(dinoId, stage)}
        </p>
        <p
          className="hidden font-display text-xs font-bold transition-colors duration-200 sm:block"
          style={{ color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
        >
          {stage.charAt(0).toUpperCase() + stage.slice(1)}
        </p>
        <p
          className="font-display text-[10px] font-bold transition-colors duration-200 sm:hidden"
          style={{ color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
        >
          {STAGES.find((s) => s.key === stage)?.shortLabel}
        </p>
      </div>
    </button>
  );
}

function ChevronArrow({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function StageEvolution({ dinoId, dinoName, activeStage, onStageChange }: StageEvolutionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const currentIdx = STAGES.findIndex((s) => s.key === activeStage);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = Math.min(currentIdx + 1, STAGES.length - 1);
      onStageChange(STAGES[nextIdx].key);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = Math.max(currentIdx - 1, 0);
      onStageChange(STAGES[prevIdx].key);
    }
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Evolution stages"
      onKeyDown={handleKeyDown}
      className="flex items-start justify-center gap-3 md:gap-5 py-4"
    >
      {STAGES.map((stage, i) => (
        <div key={stage.key} className="contents">
          <StagePortrait
            dinoId={dinoId}
            dinoName={dinoName}
            stage={stage.key}
            isActive={activeStage === stage.key}
            onClick={() => onStageChange(stage.key)}
          />
          {i < STAGES.length - 1 && (
            <div className="h-16 md:h-20 flex items-center">
              <ChevronArrow
                color={STAGE_COLORS[stage.key].primary}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
