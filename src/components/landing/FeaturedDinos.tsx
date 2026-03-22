"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS, STAGE_COLORS } from "@/lib/constants";
import { formatDexNumber } from "@/lib/utils";

const STAGES: Stage[] = ["hatchling", "juvenile", "adult"];

function FeaturedCard({ dino, index }: { dino: DinoEntry; index: number }) {
  const [hoveredStage, setHoveredStage] = useState<Stage>("adult");
  const eraColor = ERA_COLORS[dino.era];
  const dietColor = DIET_COLORS[dino.diet];
  const stageColor = STAGE_COLORS[hoveredStage];
  const stageData = dino.stages[hoveredStage];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Link href={`/dino/${String(dino.id).padStart(3, "0")}?stage=${hoveredStage}`}>
        <div
          className="group relative rounded-2xl overflow-hidden bg-white border-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          style={{ borderColor: `${eraColor.primary}40` }}
        >
          {/* Art area with era gradient */}
          <div
            className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${eraColor.light}, ${stageColor.bg})`,
            }}
          >
            {/* Dex number watermark */}
            <span
              className="absolute top-3 right-3 font-mono text-sm font-medium tracking-wider opacity-60"
              style={{ color: eraColor.primary }}
            >
              {formatDexNumber(dino.id)}
            </span>

            {/* Placeholder art — animated silhouette */}
            <motion.div
              key={hoveredStage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-8xl opacity-30 group-hover:opacity-50 transition-opacity select-none"
              style={{ color: eraColor.primary }}
              aria-hidden="true"
            >
              {hoveredStage === "hatchling" ? "🥚" : hoveredStage === "juvenile" ? "🦕" : "🦖"}
            </motion.div>

            {/* Scanline effect */}
            <div className="absolute inset-0 dex-scanline pointer-events-none" />
          </div>

          {/* Info section */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary leading-tight">
                  {dino.name}
                </h3>
                <p className="font-body text-xs text-text-secondary italic">
                  &ldquo;{dino.meaning}&rdquo;
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-mono uppercase tracking-wider"
                style={{
                  backgroundColor: dietColor.light,
                  color: dietColor.primary,
                }}
              >
                {dietColor.emoji} {dino.diet}
              </span>
            </div>

            {/* Stage description */}
            <motion.p
              key={`${dino.id}-${hoveredStage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3"
            >
              {stageData.description}
            </motion.p>

            {/* Stage selector */}
            <div className="flex gap-1.5">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onMouseEnter={() => setHoveredStage(stage)}
                  onClick={(e) => e.preventDefault()}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-display font-bold uppercase tracking-wider transition-all ${
                    hoveredStage === stage
                      ? "text-white shadow-sm scale-105"
                      : "bg-gray-50 text-text-muted hover:bg-gray-100"
                  }`}
                  style={
                    hoveredStage === stage
                      ? { backgroundColor: STAGE_COLORS[stage].primary }
                      : undefined
                  }
                >
                  {STAGE_COLORS[stage].emoji} {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface FeaturedDinosProps {
  dinos: DinoEntry[];
}

export function FeaturedDinos({ dinos }: FeaturedDinosProps) {
  // Pick T-Rex (#18), Triceratops (#19), Velociraptor (#20) or first 3
  const featured = [18, 19, 20]
    .map((id) => dinos.find((d) => d.id === id))
    .filter((d): d is DinoEntry => d !== undefined);

  const displayDinos = featured.length === 3 ? featured : dinos.slice(0, 3);

  return (
    <section className="py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-text-primary">
            Featured Species
          </h2>
          <p className="font-body text-sm text-text-secondary mt-2 max-w-md mx-auto">
            Hover over the evolution stages to preview each form — from tiny hatchling to fearsome adult.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-stage-hatchling via-stage-juvenile to-stage-adult rounded-full mx-auto mt-3" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDinos.map((dino, i) => (
            <FeaturedCard key={dino.id} dino={dino} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
