"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS } from "@/lib/constants";
import { formatDexNumber, getArtPath, getPlaceholderArtPath } from "@/lib/utils";

interface RelatedDinosProps {
  relatedDinos: DinoEntry[];
  currentId: number;
}

function RelatedDinoCard({ dino, delay }: { dino: DinoEntry; delay: number }) {
  const paddedId = String(dino.id).padStart(3, "0");
  const eraColor = ERA_COLORS[dino.era];
  const expectedArtSrc = getArtPath(dino.id, "adult", "thumb");
  const fallbackArtSrc = getPlaceholderArtPath("adult");
  const { artSrc, handleArtError } = useArtSource(expectedArtSrc, fallbackArtSrc);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link
        href={`/dino/${paddedId}`}
        className="shrink-0 w-28 block group"
      >
        <div className="bg-white rounded-xl p-2 shadow-sm border border-border-default group-hover:shadow-md group-hover:border-border-hover transition-all duration-200">
          <div
            className="aspect-square rounded-lg overflow-hidden mb-1.5 relative dex-scanline border border-white/80"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.97))",
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.7), 0 8px 18px ${eraColor.primary}14`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-8 z-0"
              style={{
                background: `linear-gradient(180deg, ${eraColor.primary}10, transparent)`,
              }}
            />
            <Image
              src={artSrc}
              alt={`${dino.name}`}
              width={128}
              height={128}
              sizes="112px"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              onError={handleArtError}
            />
          </div>
          <p className="font-mono text-[10px] text-text-muted tracking-wider">
            {formatDexNumber(dino.id)}
          </p>
          <p className="font-display text-xs font-bold text-text-primary truncate">
            {dino.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function RelatedDinos({ relatedDinos, currentId }: RelatedDinosProps) {
  const dinos = relatedDinos.filter((d) => d.id !== currentId);

  if (dinos.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-display text-sm font-bold text-text-primary">
          Related Species
        </h3>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {dinos.map((dino, i) => (
          <RelatedDinoCard key={dino.id} dino={dino} delay={i * 0.08} />
        ))}
      </div>
    </div>
  );
}
