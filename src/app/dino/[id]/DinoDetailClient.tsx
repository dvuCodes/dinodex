"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS } from "@/lib/constants";
import { formatDexNumber } from "@/lib/utils";
import { DinoArt } from "@/components/DinoArt";
import { StageSelector } from "@/components/StageSelector";
import { StatsPanel } from "@/components/StatsPanel";
import { DinoInfo } from "@/components/DinoInfo";
import { RelatedDinos } from "@/components/RelatedDinos";

interface DinoDetailClientProps {
  dino: DinoEntry;
  relatedDinos: DinoEntry[];
}

export function DinoDetailClient({ dino, relatedDinos }: DinoDetailClientProps) {
  const [stage, setStage] = useState<Stage>("adult");
  const eraColor = ERA_COLORS[dino.era];
  const dietColor = DIET_COLORS[dino.diet];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Era-colored top accent bar */}
      <div
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${eraColor.primary}, ${eraColor.primary}60)` }}
      />

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        {/* Back nav */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-accent transition-colors mb-5 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform" aria-hidden="true">&larr;</span>
            Back to Dinodex
          </Link>
        </motion.div>

        <div className="lg:grid lg:grid-cols-[5fr_4fr] lg:gap-10">
          {/* Left column: Art */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <DinoArt
              dinoId={dino.id}
              dinoName={dino.name}
              stage={stage}
              eraColor={eraColor.primary}
            />
          </motion.div>

          {/* Right column: Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 lg:mt-0"
          >
            {/* Name block */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-text-muted/70 tracking-wider">
                  {formatDexNumber(dino.id)}
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-pill font-medium"
                  style={{
                    backgroundColor: `${dietColor.primary}12`,
                    color: dietColor.primary,
                  }}
                >
                  {dietColor.emoji} {dino.diet}
                </span>
              </div>
              <h1 className="font-display text-[32px] font-black text-text-primary leading-tight">
                {dino.name}
              </h1>
              <p className="font-body text-[15px] italic text-text-secondary mt-0.5">
                &ldquo;{dino.meaning}&rdquo;
              </p>
              <p className="font-mono text-[13px] text-text-muted/70 mt-1 tracking-wide">
                {dino.pronunciation}
              </p>
            </div>

            {/* Stage selector */}
            <div className="mb-7">
              <StageSelector activeStage={stage} onStageChange={setStage} />
            </div>

            {/* Stats */}
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display text-sm font-bold text-text-primary">
                  Stats
                </h2>
                <div className="flex-1 h-px bg-border-default" />
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                  {stage}
                </span>
              </div>
              <StatsPanel
                stage={dino.stages[stage]}
                animationKey={`${dino.id}-${stage}`}
              />
            </section>

            {/* Info */}
            <section className="mb-7">
              <DinoInfo dino={dino} stage={stage} />
            </section>

            {/* Related */}
            {relatedDinos.length > 0 && (
              <section className="mb-8">
                <RelatedDinos
                  relatedDinos={relatedDinos}
                  currentId={dino.id}
                />
              </section>
            )}
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
