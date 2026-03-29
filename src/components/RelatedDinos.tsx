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
        className="group block w-28 shrink-0 rounded-[1.5rem] px-1 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1917]"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Circular portrait */}
          <div
            className="relative h-20 w-20 overflow-hidden rounded-full border-2 transition-[transform,box-shadow,border-color] duration-300 group-hover:scale-110 group-hover:shadow-[0_10px_22px_rgba(255,255,255,0.12)] group-focus-visible:scale-110 group-focus-visible:shadow-[0_10px_22px_rgba(255,255,255,0.12)]"
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
            <p className="font-mono text-[10px] tracking-wider text-white/50 transition-colors duration-200 group-hover:text-white/65 group-focus-visible:text-white/65">
              {formatDefaultDexNumber(dino.id)}
            </p>
            <p className="max-w-[100px] truncate font-display text-xs font-bold text-white/90 transition-colors duration-200 group-hover:text-white group-focus-visible:text-white">
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
