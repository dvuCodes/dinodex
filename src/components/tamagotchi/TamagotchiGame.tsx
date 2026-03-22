"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { STAGE_COLORS } from "@/lib/constants";
import type { TamagotchiState, TamagotchiAction } from "@/lib/tamagotchi";
import {
  createInitialState,
  applyAction,
  getMood,
  getMoodMessage,
  getNextEvolutionProgress,
  getActionFeedback,
  saveState,
  loadState,
  clearState,
} from "@/lib/tamagotchi";
import { DinoAvatar } from "./DinoAvatar";
import { StatBars } from "./StatBars";
import { ActionButtons } from "./ActionButtons";
import { DinoSelector } from "./DinoSelector";

interface TamagotchiGameProps {
  dinos: DinoEntry[];
}

export function TamagotchiGame({ dinos }: TamagotchiGameProps) {
  const [state, setState] = useState<TamagotchiState | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [evolved, setEvolved] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
    }
  }, []);

  const currentDino = state ? dinos.find((d) => d.id === state.dinoId) : null;

  const handleSelectDino = useCallback((dinoId: number) => {
    const newState = createInitialState(dinoId);
    setState(newState);
    saveState(newState);
    setShowSelector(false);
    setFeedback(null);
    setEvolved(false);
  }, []);

  const handleAction = useCallback((action: TamagotchiAction) => {
    if (!state || isActing) return;

    setIsActing(true);
    const prevStage = state.stage;
    const newState = applyAction(state, action);
    setState(newState);
    saveState(newState);

    // Show feedback
    setFeedback(getActionFeedback(action));
    setTimeout(() => setFeedback(null), 1500);

    // Check for evolution
    if (newState.stage !== prevStage) {
      setEvolved(true);
      setTimeout(() => setEvolved(false), 3000);
    }

    setTimeout(() => setIsActing(false), 400);
  }, [state, isActing]);

  const handleReset = useCallback(() => {
    clearState();
    setState(null);
    setFeedback(null);
    setEvolved(false);
  }, []);

  // No dino selected — show selector prompt
  if (!state || !currentDino) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-border-default">
          <div className="max-w-[600px] mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-body text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <span>←</span> Home
            </Link>
            <h1 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
              <span>🥚</span> Dino Care
            </h1>
            <div className="w-14" />
          </div>
        </header>

        {/* Empty state */}
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-sm"
          >
            <motion.span
              animate={{ rotate: [-5, 5, -5], y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl inline-block mb-6"
            >
              🥚
            </motion.span>
            <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
              Adopt a Dinosaur
            </h2>
            <p className="font-body text-sm text-text-secondary mb-8 leading-relaxed">
              Choose your very own prehistoric companion. Feed them, play with them, and watch them evolve!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSelector(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-era-jurassic to-stage-hatchling text-white font-display font-bold text-lg shadow-lg shadow-era-jurassic/25 cursor-pointer"
            >
              Choose Your Dino →
            </motion.button>
          </motion.div>
        </main>

        <DinoSelector
          dinos={dinos}
          isOpen={showSelector}
          onSelect={handleSelectDino}
          onClose={() => setShowSelector(false)}
        />
      </div>
    );
  }

  const mood = getMood(state.stats);
  const moodMessage = getMoodMessage(mood, currentDino.name);
  const evoProgress = getNextEvolutionProgress(state);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-border-default">
        <div className="max-w-[600px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-body text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <span>←</span> Home
          </Link>
          <h1 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
            <span>🥚</span> Dino Care
          </h1>
          <button
            onClick={() => setShowSelector(true)}
            className="font-body text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Switch
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[480px] mx-auto w-full px-4 py-6">
        {/* Evolution alert */}
        <AnimatePresence>
          {evolved && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-era-triassic/10 via-accent/10 to-era-jurassic/10 border border-accent/20 text-center"
            >
              <span className="text-3xl">⚡</span>
              <p className="font-display font-bold text-lg text-text-primary mt-1">
                {currentDino.name} evolved to {state.stage}!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dino Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <DinoAvatar
            dinoName={currentDino.name}
            stage={state.stage}
            mood={mood}
            era={currentDino.era}
            lastAction={state.lastAction}
          />
        </motion.div>

        {/* Name & mood */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h2 className="font-display font-bold text-2xl text-text-primary">
            {currentDino.name}
          </h2>
          <p className="font-body text-sm text-text-secondary mt-1">
            {moodMessage}
          </p>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-display font-bold text-sm mt-2"
                style={{ color: STAGE_COLORS[state.stage].primary }}
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-border-default p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display text-sm font-bold text-text-primary">Vitals</h3>
            <div className="flex-1 h-px bg-border-default" />
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
              {state.stage}
            </span>
          </div>
          <StatBars stats={state.stats} />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <ActionButtons onAction={handleAction} disabled={isActing} />
        </motion.div>

        {/* Evolution progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-border-default p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-sm font-bold text-text-primary">Evolution</h3>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          {/* Stage indicators */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {(["hatchling", "juvenile", "adult"] as const).map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    state.stage === stage
                      ? "ring-2 ring-offset-2 scale-110"
                      : stage === "adult" && state.stage !== "adult"
                        ? "opacity-40"
                        : stage === "juvenile" && state.stage === "hatchling"
                          ? "opacity-40"
                          : ""
                  }`}
                  style={{
                    backgroundColor: STAGE_COLORS[stage].bg,
                    ...(state.stage === stage ? { "--tw-ring-color": STAGE_COLORS[stage].primary } as React.CSSProperties : {}),
                  }}
                >
                  {STAGE_COLORS[stage].emoji}
                </div>
                {i < 2 && (
                  <span className="text-text-muted/40 text-xs">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {state.stage !== "adult" && (
            <div className="h-2 rounded-pill bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-pill bg-gradient-to-r from-stage-hatchling to-stage-juvenile"
                animate={{ width: `${evoProgress}%` }}
                transition={{ duration: 0.5, type: "spring" }}
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[10px] text-text-muted">
              Care score: {state.careScore}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {state.totalInteractions} interactions
            </span>
          </div>
        </motion.div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <button
            onClick={() => setShowSelector(true)}
            className="font-body text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Change Dino
          </button>
          <span className="text-text-muted/30">·</span>
          <button
            onClick={handleReset}
            className="font-body text-xs text-text-muted hover:text-era-cretaceous transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </main>

      <DinoSelector
        dinos={dinos}
        isOpen={showSelector}
        onSelect={handleSelectDino}
        onClose={() => setShowSelector(false)}
      />
    </div>
  );
}
