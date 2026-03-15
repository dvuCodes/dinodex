"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Stage } from "@/lib/types";
import { formatDexNumber } from "@/lib/utils";

interface DinoArtProps {
  dinoId: number;
  dinoName: string;
  stage: Stage;
  eraColor: string;
}

export function DinoArt({ dinoId, dinoName, stage, eraColor }: DinoArtProps) {
  const paddedId = String(dinoId).padStart(3, "0");
  const artSrc = `/dinos/${paddedId}/${stage}.svg`;

  return (
    <div
      className="relative aspect-[4/3] rounded-card overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${eraColor}20, ${eraColor}40)`,
      }}
    >
      <span className="absolute top-4 left-4 font-mono text-2xl font-medium text-white/30 z-10">
        {formatDexNumber(dinoId)}
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${dinoId}-${stage}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center p-8"
        >
          <Image
            src={artSrc}
            alt={`Anime illustration of ${stage} ${dinoName}`}
            width={1024}
            height={1024}
            priority
            className="w-full h-full object-contain"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
