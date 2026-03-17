"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Stage } from "@/lib/types";
import { formatStageDexNumber, getStageDexId } from "@/lib/utils";
import { STAGE_COLORS } from "@/lib/constants";

interface DinoArtProps {
  dinoId: number;
  dinoName: string;
  stage: Stage;
  eraColor: string;
}

export function DinoArt({ dinoId, dinoName, stage, eraColor }: DinoArtProps) {
  const paddedId = String(dinoId).padStart(3, "0");
  const paddedStageDexId = String(getStageDexId(dinoId, stage)).padStart(2, "0");
  const artSrc = `/dinos/${paddedId}/${stage}.svg`;
  const stageColor = STAGE_COLORS[stage];

  return (
    <div
      className="relative aspect-[4/3] rounded-card overflow-hidden dex-scanline"
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, ${eraColor}25 0%, transparent 60%),
          radial-gradient(ellipse at 70% 80%, ${stageColor.primary}15 0%, transparent 50%),
          linear-gradient(160deg, ${eraColor}18, ${eraColor}08 40%, ${eraColor}30 100%)
        `,
      }}
    >
      {/* Large watermark dex number */}
      <span className="absolute -bottom-2 -right-1 font-mono text-[120px] font-black leading-none text-black/[0.03] select-none z-0">
        {paddedStageDexId}
      </span>

      {/* Top-left dex badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-white/50 drop-shadow-sm">
          {formatStageDexNumber(dinoId, stage)}
        </span>
      </div>

      {/* Stage indicator dot */}
      <div className="absolute top-3 right-3 z-20">
        <div
          className="w-3 h-3 rounded-full border-2 border-white/40"
          style={{ backgroundColor: stageColor.primary, boxShadow: `0 0 8px ${stageColor.primary}60` }}
        />
      </div>

      {/* Art with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${dinoId}-${stage}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full h-full flex items-center justify-center p-6"
        >
          <Image
            src={artSrc}
            alt={`Anime illustration of ${stage} ${dinoName}`}
            width={1024}
            height={1024}
            priority
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom gradient fade for depth */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${eraColor}20, transparent)`,
        }}
      />
    </div>
  );
}
