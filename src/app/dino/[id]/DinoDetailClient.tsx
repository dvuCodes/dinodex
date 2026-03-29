"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { DinoEntry, Stage } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS } from "@/lib/constants";
import { formatStageDexNumber, formatDexNumber, getDinoPageTitle } from "@/lib/utils";
import { DinoArt } from "@/components/DinoArt";
import { StageEvolution } from "@/components/StageEvolution";
import { StatsPanel } from "@/components/StatsPanel";
import { DinoInfo } from "@/components/DinoInfo";
import { RelatedDinos } from "@/components/RelatedDinos";
import { DinoNavStrip } from "@/components/DinoNavStrip";
import { BadgePill } from "@/components/BadgePills";

interface DinoDetailClientProps {
  dino: DinoEntry;
  relatedDinos: DinoEntry[];
  prevDino: DinoEntry;
  nextDino: DinoEntry;
  initialStage: Stage;
}

export function DinoDetailClient({ dino, relatedDinos, prevDino, nextDino, initialStage }: DinoDetailClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(initialStage);
  const eraColor = ERA_COLORS[dino.era];
  const dietColor = DIET_COLORS[dino.diet];
  const fadeMotion = (delay = 0, y = 12) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  useEffect(() => {
    document.title = getDinoPageTitle(dino.name, dino.id, stage);
  }, [dino.id, dino.name, stage]);

  function handleStageChange(nextStage: Stage) {
    setStage(nextStage);

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextStage === "adult") {
      nextSearchParams.delete("stage");
    } else {
      nextSearchParams.set("stage", nextStage);
    }

    const nextUrl = nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <motion.main
      id="main-content"
      {...(reduceMotion
        ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } })}
      className="min-h-screen"
    >
      {/* Nav strip */}
      <DinoNavStrip
        prevDino={prevDino}
        nextDino={nextDino}
        currentEraColor={eraColor.primary}
      />

      <div className="max-w-[1200px] mx-auto px-4 py-5">
        {/* Back link */}
        <motion.div
          {...fadeMotion(0.05, -12)}
        >
          <Link
            href="/"
            className="group mb-4 inline-flex items-center gap-1.5 rounded-pill px-2 py-1 font-body text-sm text-text-secondary transition-[color,box-shadow] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment focus-visible:text-accent"
          >
            <span className="transition-transform group-hover:-translate-x-1 group-focus-visible:-translate-x-1" aria-hidden="true">&larr;</span>
            Back to Dinodex
          </Link>
        </motion.div>

        {/* Hero header — centered */}
        <motion.header
          {...fadeMotion(0.1, 12)}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <span
              className="font-mono text-base tracking-wider font-medium"
              style={{ color: eraColor.primary }}
            >
              {formatDexNumber(dino.id)}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary leading-tight">
            {dino.name}
          </h1>
          <p className="font-body text-[15px] italic text-text-secondary mt-1">
            &ldquo;{dino.meaning}&rdquo;
          </p>
          <p className="font-mono text-[13px] text-text-muted/70 mt-0.5 tracking-wide">
            {dino.pronunciation}
          </p>

          {/* Badge pills */}
          <motion.div
            {...fadeMotion(0.25, 8)}
            className="flex flex-wrap items-center justify-center gap-2 mt-3"
          >
            <BadgePill
              label={dino.era}
              color={eraColor.primary}
            />
            <BadgePill
              label={dino.diet}
              color={dietColor.primary}
              emoji={dietColor.emoji}
            />
            <BadgePill
              label={dino.type}
              color="#6B7280"
            />
            <BadgePill
              label={dino.locomotion}
              color="#8B5CF6"
            />
          </motion.div>
        </motion.header>

        {/* Two-column grid */}
        <div className="lg:grid lg:grid-cols-[5fr_4fr] lg:gap-10">
          {/* Left column: Art + Stage Evolution */}
          <div>
            <motion.div
              {...fadeMotion(0.15, 16)}
            >
              <DinoArt
                dinoId={dino.id}
                dinoName={dino.name}
                stage={stage}
                eraColor={eraColor.primary}
              />
            </motion.div>

            {/* Stage Evolution Timeline */}
            <motion.div
              {...fadeMotion(0.25, 12)}
            >
              <StageEvolution
                dinoId={dino.id}
                dinoName={dino.name}
                activeStage={stage}
                onStageChange={handleStageChange}
              />
            </motion.div>
          </div>

          {/* Right column: Info */}
          <motion.div
            {...fadeMotion(0.3, 16)}
            className="mt-2 lg:mt-0"
          >
            {/* Stats */}
            <section className="mb-6">
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
            <section className="mb-6">
              <DinoInfo dino={dino} stage={stage} />
            </section>

            {/* Related */}
            {relatedDinos.length > 0 && (
              <section>
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
