"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { ERA_COLORS } from "@/lib/constants";
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

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-4 py-4"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-body text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
      >
        <span aria-hidden="true">&larr;</span> Back to Dinodex
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-8">
        {/* Left column: Art */}
        <div>
          <DinoArt
            dinoId={dino.id}
            dinoName={dino.name}
            stage={stage}
            eraColor={eraColor.primary}
          />
        </div>

        {/* Right column: Info */}
        <div className="mt-4 lg:mt-0">
          <div className="mb-4">
            <p className="font-mono text-sm text-text-muted">
              {formatDexNumber(dino.id)}
            </p>
            <h1 className="font-display text-[28px] font-bold text-text-primary">
              {dino.name}
            </h1>
            <p className="font-body text-sm italic text-text-secondary">
              &ldquo;{dino.meaning}&rdquo;
            </p>
            <p className="font-mono text-[13px] text-text-muted mt-0.5">
              {dino.pronunciation}
            </p>
          </div>

          <div className="mb-6">
            <StageSelector activeStage={stage} onStageChange={setStage} />
          </div>

          <section className="mb-6">
            <h2 className="font-body text-base font-bold text-text-primary mb-3">
              Stats
            </h2>
            <StatsPanel
              stage={dino.stages[stage]}
              animationKey={`${dino.id}-${stage}`}
            />
          </section>

          <section className="mb-6">
            <DinoInfo dino={dino} stage={stage} />
          </section>

          {relatedDinos.length > 0 && (
            <section className="mb-6">
              <RelatedDinos
                relatedDinos={relatedDinos}
                currentId={dino.id}
              />
            </section>
          )}
        </div>
      </div>
    </motion.main>
  );
}
