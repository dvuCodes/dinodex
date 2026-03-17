"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { Stage } from "@/lib/types";
import { formatDexNumber, getArtPath, getPlaceholderArtPath } from "@/lib/utils";
import { STAGE_COLORS } from "@/lib/constants";

interface DinoArtProps {
  dinoId: number;
  dinoName: string;
  stage: Stage;
  eraColor: string;
}

export function DinoArt({ dinoId, dinoName, stage, eraColor }: DinoArtProps) {
  const paddedId = String(dinoId).padStart(3, "0");
  const expectedArtSrc = getArtPath(dinoId, stage);
  const fallbackArtSrc = getPlaceholderArtPath(stage);
  const { artSrc, handleArtError } = useArtSource(expectedArtSrc, fallbackArtSrc);
  const stageColor = STAGE_COLORS[stage];

  return (
    <div
      className="relative aspect-[4/3] rounded-card overflow-hidden dex-scanline border border-white/80"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.97))",
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.8), 0 18px 44px ${eraColor}20`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 z-[1]"
        style={{
          background: `linear-gradient(180deg, ${eraColor}12, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[1]"
        style={{
          background: `linear-gradient(0deg, ${stageColor.primary}12, transparent)`,
        }}
      />

      {/* Large watermark dex number */}
      <span className="absolute -bottom-2 -right-1 font-mono text-[120px] font-black leading-none text-black/[0.03] select-none z-0">
        {paddedId}
      </span>

      {/* Top-left dex badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-white/50 drop-shadow-sm">
          {formatDexNumber(dinoId)}
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
          className="relative z-10 w-full h-full flex items-center justify-center p-6"
        >
          <Image
            src={artSrc}
            alt={`Anime illustration of ${stage} ${dinoName}`}
            width={1024}
            height={1024}
            priority
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="w-full h-full object-contain drop-shadow-lg"
            onError={handleArtError}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom gradient fade for depth */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(to top, ${eraColor}10, transparent)`,
        }}
      />
    </div>
  );
}
