"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { DIET_COLORS, ERA_COLORS } from "@/lib/constants";
import { formatDexNumber } from "@/lib/utils";

export function DinoCard({ dino }: { dino: DinoEntry }) {
  const dietColor = DIET_COLORS[dino.diet];
  const eraColor = ERA_COLORS[dino.era];
  const paddedId = String(dino.id).padStart(3, "0");
  const artSrc = `/dinos/${paddedId}/adult.svg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/dino/${paddedId}`}>
        <div
          className="bg-white rounded-card p-3 shadow-sm hover:shadow-lg transition-shadow duration-200"
          style={{
            border: `2px solid ${dietColor.primary}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-medium text-text-secondary">
              {formatDexNumber(dino.id)}
            </span>
            <span className="text-sm" aria-label={dino.diet}>
              {dietColor.emoji}
            </span>
          </div>

          <div
            className="aspect-square rounded-xl overflow-hidden mb-2"
            style={{ backgroundColor: eraColor.light }}
          >
            <Image
              src={artSrc}
              alt={`Anime illustration of adult ${dino.name}`}
              width={512}
              height={512}
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="font-display text-base font-bold text-text-primary truncate">
            {dino.name}
          </h2>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs">{dietColor.emoji}</span>
            <span className="font-body text-xs text-text-secondary capitalize">
              {dino.diet}
            </span>
          </div>
          <p className="font-body text-xs text-text-muted capitalize mt-0.5">
            {dino.era}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
