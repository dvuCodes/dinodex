"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import type { DinoEntry } from "@/lib/types";
import { DIET_COLORS, ERA_COLORS } from "@/lib/constants";
import {
  formatDefaultDexNumber,
  getArtPath,
  getPlaceholderArtPath,
  getStageDexId,
} from "@/lib/utils";

export function DinoCard({ dino }: { dino: DinoEntry }) {
  const reduceMotion = useReducedMotion();
  const dietColor = DIET_COLORS[dino.diet];
  const eraColor = ERA_COLORS[dino.era];
  const paddedId = String(dino.id).padStart(3, "0");
  const expectedArtSrc = getArtPath(dino.id, "adult", "thumb");
  const fallbackArtSrc = getPlaceholderArtPath("adult");
  const { artSrc, handleArtError } = useArtSource(expectedArtSrc, fallbackArtSrc);

  return (
    <motion.div
      variants={
        reduceMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0 } },
            }
          : {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
            }
      }
      whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/dino/${paddedId}`} className="block">
        <div
          className="relative bg-white rounded-card p-3 transition-[transform,box-shadow,border-color] duration-300 card-glow overflow-hidden"
          style={{
            border: `2px solid ${dietColor.primary}`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.06)`,
            ["--glow-color" as string]: `${dietColor.primary}15`,
          }}
        >
          {/* Decorative corner triangle */}
          <div
            className="absolute top-0 right-0 w-12 h-12 opacity-[0.07]"
            style={{
              background: `linear-gradient(135deg, transparent 50%, ${eraColor.primary} 50%)`,
            }}
          />

          {/* Dex number with mono treatment */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="font-mono text-[13px] font-medium text-text-muted tracking-wider">
              {formatDefaultDexNumber(dino.id)}
            </span>
            <span
              className="text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-pill"
              style={{
                backgroundColor: `${dietColor.primary}12`,
                color: dietColor.primary,
              }}
            >
              {dietColor.emoji} {dino.diet}
            </span>
          </div>

          {/* Art container with radial glow */}
          <div
            className="relative aspect-square rounded-xl overflow-hidden mb-2.5 dex-scanline border border-white/80"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.97))",
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.7), 0 10px 24px ${eraColor.primary}14`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-10 z-0"
              style={{
                background: `linear-gradient(180deg, ${eraColor.primary}10, transparent)`,
              }}
            />
            {/* Faint dex number watermark */}
            <span
              className="absolute bottom-1 right-2 font-mono text-[40px] font-black leading-none opacity-[0.04] select-none z-0"
            >
              {paddedId}
            </span>
            <Image
              src={artSrc}
              alt={`Anime illustration of adult ${dino.name}`}
              width={512}
              height={512}
              unoptimized
              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 20vw"
              className={
                reduceMotion
                  ? "w-full h-full object-contain relative z-[1]"
                  : "w-full h-full object-contain relative z-[1] group-hover:scale-105 transition-transform duration-500"
              }
              onError={handleArtError}
            />
          </div>

          {/* Name and era */}
          <h2 className="font-display text-[15px] font-bold text-text-primary truncate leading-tight">
            {dino.name}
          </h2>
          <p
            className="font-body text-[11px] font-medium capitalize mt-0.5"
            style={{ color: eraColor.primary }}
          >
            {dino.era} Era
          </p>

          {/* Hover border glow */}
          <div
            className="absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${dietColor.primary}20, 0 8px 32px rgba(0,0,0,0.12)`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
