"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { Stage } from "@/lib/types";
import {
  formatStageDexNumber,
  getArtPath,
  getPlaceholderArtPath,
  getStageDexId,
} from "@/lib/utils";
import { STAGE_COLORS } from "@/lib/constants";

interface DinoArtProps {
  dinoId: number;
  dinoName: string;
  stage: Stage;
  eraColor: string;
}

export function DinoArt({ dinoId, dinoName, stage, eraColor }: DinoArtProps) {
  const paddedStageDexId = String(getStageDexId(dinoId, stage)).padStart(2, "0");
  const expectedArtSrc = getArtPath(dinoId, stage);
  const fallbackArtSrc = getPlaceholderArtPath(stage);
  const { artSrc, handleArtError } = useArtSource(expectedArtSrc, fallbackArtSrc);
  const stageColor = STAGE_COLORS[stage];

  return (
    <div
      className="relative aspect-[4/3] rounded-card overflow-hidden dex-scanline dex-stripes border border-white/80"
      style={{
        background: `linear-gradient(135deg, ${eraColor}12, rgba(255,255,255,0.97) 50%, ${stageColor.bg}20)`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.8), 0 20px 50px ${eraColor}18, 0 8px 24px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Top era gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 z-[1]"
        style={{
          background: `linear-gradient(180deg, ${eraColor}15, transparent)`,
        }}
      />
      {/* Bottom stage gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[1]"
        style={{
          background: `linear-gradient(0deg, ${stageColor.primary}12, transparent)`,
        }}
      />

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
          style={{ backgroundColor: stageColor.primary, boxShadow: `0 0 10px ${stageColor.primary}60` }}
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
          className="relative z-10 w-full h-full flex items-center justify-center p-6"
        >
          <Image
            src={artSrc}
            alt={`Anime illustration of ${stage} ${dinoName}`}
            width={1024}
            height={1024}
            priority
            unoptimized
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="w-full h-full object-contain drop-shadow-lg"
            onError={handleArtError}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
