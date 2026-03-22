"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS } from "@/lib/constants";
import { formatDefaultDexNumber, getArtPath, getPlaceholderArtPath } from "@/lib/utils";

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
        className="shrink-0 w-28 block group text-center"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Circular portrait */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2 relative group-hover:scale-110 transition-transform duration-300"
            style={{
              borderColor: `${eraColor.primary}60`,
              background: `linear-gradient(135deg, ${eraColor.light}40, rgba(255,255,255,0.1))`,
            }}
          >
            <Image
              src={artSrc}
              alt={dino.name}
              width={128}
              height={128}
              unoptimized
              sizes="80px"
              className="w-full h-full object-contain p-1"
              onError={handleArtError}
            />
          </div>
          <div>
            <p className="font-mono text-[10px] text-white/50 tracking-wider">
              {formatDefaultDexNumber(dino.id)}
            </p>
            <p className="font-display text-xs font-bold text-white/90 truncate max-w-[100px]">
              {dino.name}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function RelatedDinos({ relatedDinos, currentId }: RelatedDinosProps) {
  const dinos = relatedDinos.filter((d) => d.id !== currentId);

  if (dinos.length === 0) return null;

  return (
    <div className="rounded-card overflow-hidden" style={{ backgroundColor: "#1C1917" }}>
      <div className="px-5 pt-4 pb-1">
        <h3 className="font-display text-sm font-bold text-white/80">
          Related Species
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto px-5 pb-5 pt-2 scrollbar-hide">
        {dinos.map((dino, i) => (
          <RelatedDinoCard key={dino.id} dino={dino} delay={i * 0.08} />
        ))}
      </div>
    </div>
  );
}
