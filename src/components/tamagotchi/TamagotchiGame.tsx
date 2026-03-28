"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { TAMAGOTCHI_STAGE_COLORS } from "@/lib/constants";
import type { TamagotchiState, TamagotchiAction, TamagotchiStage } from "@/lib/tamagotchi";
import {
  createInitialState,
  applyAction,
  checkHatch,
  getHatchProgress,
  getHatchTimeRemaining,
  getMood,
  getMoodMessage,
  getNextEvolutionProgress,
  getActionFeedback,
  syncStateRef,
  saveState,
  loadState,
  clearState,
} from "@/lib/tamagotchi";
import { DinoAvatar } from "./DinoAvatar";
import { StatBars } from "./StatBars";
import { ActionButtons } from "./ActionButtons";
import { DinoSelector } from "./DinoSelector";
import { EggCountdown } from "./EggCountdown";

interface TamagotchiGameProps {
  dinos: DinoEntry[];
}

const TAMA_STAGES: TamagotchiStage[] = ["egg", "hatchling", "juvenile", "adult"];

export function TamagotchiGame({ dinos }: TamagotchiGameProps) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<TamagotchiState | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [evolved, setEvolved] = useState(false);
  const [hatchAlert, setHatchAlert] = useState(false);
  const stateRef = useRef<TamagotchiState | null>(null);
  const openSelector = useCallback(() => setShowSelector(true), []);
  const closeSelector = useCallback(() => setShowSelector(false), []);

  const introMotion = useCallback(
    (delay = 0, y = 10) =>
      reduceMotion
        ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
        : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { delay } },
    [reduceMotion]
  );

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load saved state on mount (with hatch check for time-away hatching)
  useEffect(() => {
    const saved = loadState();
    if (!saved) return;
    const checked = checkHatch(saved);
    const justHatched = checked.stage !== saved.stage;
    if (justHatched) saveState(checked);
    syncStateRef(stateRef, checked, setState);
    if (justHatched) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only localStorage init on mount
      setHatchAlert(true);
    }
  }, []);

  // Clear hatch alert after delay
  useEffect(() => {
    if (!hatchAlert) return;
    const timeout = setTimeout(() => setHatchAlert(false), 4000);
    return () => clearTimeout(timeout);
  }, [hatchAlert]);

  // Egg timer: poll every second to update countdown and detect hatch
  const isEggStage = state?.stage === "egg";
  useEffect(() => {
    if (!isEggStage) return;

    const interval = setInterval(() => {
      const current = stateRef.current;
      if (!current || current.stage !== "egg") return;

      const hatched = checkHatch(current);
      if (hatched.stage !== "egg") {
        syncStateRef(stateRef, hatched, setState);
        saveState(hatched);
        setHatchAlert(true);
        setTimeout(() => setHatchAlert(false), 4000);
      } else {
        // Force re-render for countdown update
        syncStateRef(stateRef, { ...current }, setState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEggStage]);

  const currentDino = state ? dinos.find((d) => d.id === state.dinoId) : null;

  const handleSelectDino = useCallback((dinoId: number) => {
    const newState = createInitialState(dinoId);
    syncStateRef(stateRef, newState, setState);
    saveState(newState);
    setShowSelector(false);
    setFeedback(null);
    setEvolved(false);
    setHatchAlert(false);
  }, []);

  const handleAction = useCallback((action: TamagotchiAction) => {
    if (!state || isActing || state.stage === "egg") return;

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
    syncStateRef(stateRef, null, setState);
    setFeedback(null);
    setEvolved(false);
    setHatchAlert(false);
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
        <main id="main-content" className="flex-1 flex items-center justify-center px-4">
          <motion.div
            {...introMotion(0, 20)}
            className="text-center max-w-sm"
          >
            <motion.span
              animate={reduceMotion ? { rotate: 0, y: 0 } : { rotate: [-5, 5, -5], y: [0, -8, 0] }}
              transition={reduceMotion ? { duration: 0 } : { duration: 3, repeat: Infinity }}
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
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              onClick={openSelector}
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
          onClose={closeSelector}
        />
      </div>
    );
  }

  const isEgg = state.stage === "egg";
  const mood = getMood(state.stats);
  const moodMessage = isEgg
    ? `${currentDino.name}'s egg is incubating...`
    : getMoodMessage(mood, currentDino.name);
  const evoProgress = getNextEvolutionProgress(state);
  const stageColor = TAMAGOTCHI_STAGE_COLORS[state.stage];

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

      <main id="main-content" className="flex-1 max-w-[480px] mx-auto w-full px-4 py-6">
        {/* Hatch alert */}
        <AnimatePresence>
          {hatchAlert && (
            <motion.div
              {...(reduceMotion
                ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
                : { initial: { opacity: 0, y: -20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.3 } })}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-stage-hatchling/15 via-accent/10 to-era-jurassic/15 border border-stage-hatchling/30 text-center"
            >
              <span className="text-3xl">🐣</span>
              <p className="font-display font-bold text-lg text-text-primary mt-1">
                {currentDino.name}&apos;s egg has hatched!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evolution alert */}
        <AnimatePresence>
          {evolved && (
            <motion.div
              {...(reduceMotion
                ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
                : { initial: { opacity: 0, y: -20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.3 } })}
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
          {...introMotion(0.1, 0)}
          className="mb-6"
        >
          <DinoAvatar
            dinoName={currentDino.name}
            stage={state.stage}
            mood={mood}
            era={currentDino.era}
            lastAction={state.lastAction}
            lastActionTime={state.lastActionTime}
          />
        </motion.div>

        {/* Name & mood */}
        <motion.div
          {...introMotion(0.1, 10)}
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
            {feedback && !isEgg && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-display font-bold text-sm mt-2"
                style={{ color: stageColor.primary }}
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Egg countdown OR Stats + Actions */}
        {isEgg ? (
          <motion.div
            {...introMotion(0.2, 10)}
            className="bg-white rounded-2xl border border-border-default p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <h3 className="font-display text-sm font-bold text-text-primary">Incubation</h3>
              <div className="flex-1 h-px bg-border-default" />
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                egg
              </span>
            </div>
            <EggCountdown
              timeRemainingMs={getHatchTimeRemaining(state)}
              progress={getHatchProgress(state)}
              dinoName={currentDino.name}
            />
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              {...introMotion(0.2, 10)}
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
              {...introMotion(0.3, 10)}
              className="mb-6"
            >
              <ActionButtons onAction={handleAction} disabled={isActing} />
            </motion.div>
          </>
        )}

        {/* Incubation message when egg (replaces action buttons area) */}
        {isEgg && (
          <motion.div
            {...introMotion(0.3, 10)}
            className="mb-6"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "🍖", label: "Feed", color: "#F97316" },
                { emoji: "🎮", label: "Play", color: "#8B5CF6" },
                { emoji: "😴", label: "Sleep", color: "#3B82F6" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl bg-white border-2 shadow-sm opacity-35 cursor-not-allowed"
                  style={{ borderColor: `${item.color}15` }}
                >
                  <span className="text-3xl grayscale">{item.emoji}</span>
                  <span className="font-display font-bold text-sm text-text-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center font-body text-xs text-text-muted mt-3">
              Wait for the egg to hatch before interacting
            </p>
          </motion.div>
        )}

        {/* Evolution progress */}
        <motion.div
          {...introMotion(0.4, 10)}
          className="bg-white rounded-2xl border border-border-default p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-sm font-bold text-text-primary">Evolution</h3>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          {/* Stage indicators (now 4 stages) */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {TAMA_STAGES.map((stage, i) => {
              const sc = TAMAGOTCHI_STAGE_COLORS[stage];
              const stageIdx = TAMA_STAGES.indexOf(state.stage);
              const isActive = state.stage === stage;
              const isPast = TAMA_STAGES.indexOf(stage) < stageIdx;
              const isFuture = TAMA_STAGES.indexOf(stage) > stageIdx;

              return (
                <div key={stage} className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      isActive
                        ? "ring-2 ring-offset-1 scale-110"
                        : isFuture
                          ? "opacity-35"
                          : isPast
                            ? "opacity-70"
                            : ""
                    }`}
                    style={{
                      backgroundColor: sc.bg,
                      ...(isActive ? { "--tw-ring-color": sc.primary } as React.CSSProperties : {}),
                    }}
                  >
                    {sc.emoji}
                  </div>
                  {i < TAMA_STAGES.length - 1 && (
                    <span className="text-text-muted/40 text-[10px]">→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar (for non-egg, non-adult) */}
          {!isEgg && state.stage !== "adult" && (
            <div className="h-2 rounded-pill bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-pill bg-gradient-to-r from-stage-hatchling to-stage-juvenile"
                animate={{ width: `${evoProgress}%` }}
                transition={{ duration: 0.5, type: "spring" }}
              />
            </div>
          )}

          {isEgg ? (
            <p className="font-mono text-[10px] text-text-muted mt-2 text-center">
              Egg must hatch before evolution begins
            </p>
          ) : (
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[10px] text-text-muted">
                Care score: {state.careScore}
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {state.totalInteractions} interactions
              </span>
            </div>
          )}
        </motion.div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <button
            onClick={openSelector}
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
        onClose={closeSelector}
      />
    </div>
  );
}
