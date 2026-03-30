"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS, TAMAGOTCHI_STAGE_COLORS } from "@/lib/constants";
import type { AttentionReason, TamagotchiAction, TamagotchiMetaProgression, TamagotchiState } from "@/lib/tamagotchi";
import {
  applyPlayerAction,
  clearAllProgress,
  createInitialState,
  didActionApply,
  getActionFeedback,
  getHatchProgress,
  getHatchTimeRemaining,
  getMood,
  getMoodMessage,
  getNextEvolutionProgress,
  getTamagotchiAnimationState,
  loadAndReconcileState,
  loadMetaProgression,
  reconcileMetaProgression,
  resetCurrentRun,
  saveMetaProgression,
  saveState,
  skipIncubation,
  simulateElapsedTime,
} from "@/lib/tamagotchi";
import { Button, buttonVariants } from "@/components/ui/Button";
import { isTamagotchiDebugEnabled } from "@/lib/tamagotchi-debug";
import { formatDexNumber } from "@/lib/utils";
import { ActionButtons } from "./ActionButtons";
import { DinoAvatar } from "./DinoAvatar";
import { DinoSelector } from "./DinoSelector";
import { EggCountdown } from "./EggCountdown";
import { StatBars } from "./StatBars";

interface TamagotchiGameProps {
  dinos: DinoEntry[];
}

function getStatusHeadline(attentionReason: AttentionReason | null, dinoName: string) {
  switch (attentionReason) {
    case "hunger":
      return `${dinoName} is crying for a meal.`;
    case "happiness":
      return `${dinoName} is restless and wants attention.`;
    case "energy":
      return `${dinoName} is fading and needs rest.`;
    case "mess":
      return `${dinoName}'s room needs cleaning.`;
    case "health":
      return `${dinoName} needs care immediately.`;
    case "sleep":
      return `${dinoName} should be asleep right now.`;
    case "discipline":
      return `${dinoName} is testing your patience.`;
    default:
      return `${dinoName} is waiting for your next move.`;
  }
}

function loadInitialRunData(): { state: TamagotchiState | null; meta: TamagotchiMetaProgression } {
  const state = loadAndReconcileState();
  const storedMeta = loadMetaProgression();
  const meta = reconcileMetaProgression(storedMeta, state);

  if (meta !== storedMeta) {
    saveMetaProgression(meta);
  }

  return { state, meta };
}

export function TamagotchiGame({ dinos }: TamagotchiGameProps) {
  const reduceMotion = useReducedMotion();
  const debugEnabled = isTamagotchiDebugEnabled();
  const [initialData] = useState<{ state: TamagotchiState | null; meta: TamagotchiMetaProgression }>(() => loadInitialRunData());
  const [state, setState] = useState<TamagotchiState | null>(initialData.state);
  const [meta, setMeta] = useState<TamagotchiMetaProgression>(initialData.meta);
  const [showSelector, setShowSelector] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [justChangedStage, setJustChangedStage] = useState(false);
  const [justHatched, setJustHatched] = useState(false);
  const [debugSpeciesId, setDebugSpeciesId] = useState<number | null>(initialData.state?.speciesId ?? null);
  const stateRef = useRef<TamagotchiState | null>(initialData.state);
  const metaRef = useRef<TamagotchiMetaProgression>(initialData.meta);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const commitState = useCallback((nextState: TamagotchiState) => {
    stateRef.current = nextState;
    saveState(nextState);

    const nextMeta = reconcileMetaProgression(metaRef.current, nextState);
    if (nextMeta !== metaRef.current) {
      metaRef.current = nextMeta;
      saveMetaProgression(nextMeta);
      setMeta(nextMeta);
    }

    setState(nextState);
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }

    const intervalMs = state.stage === "egg" ? 1_000 : 60_000;
    const interval = window.setInterval(() => {
      const current = stateRef.current;
      if (!current) {
        return;
      }

      const reconciled = simulateElapsedTime(current, Date.now());
      if (JSON.stringify(reconciled) !== JSON.stringify(current)) {
        commitState(reconciled);
      } else if (current.stage === "egg") {
        setState({ ...current });
      }
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [commitState, state]);

  const currentDino = state ? dinos.find((dino) => dino.id === state.speciesId) ?? null : null;
  const mood = state ? getMood(state.stats) : "neutral";
  const stageColor = state ? TAMAGOTCHI_STAGE_COLORS[state.stage] : TAMAGOTCHI_STAGE_COLORS.egg;
  const shellAccent = currentDino ? ERA_COLORS[currentDino.era] : ERA_COLORS.jurassic;

  const openSelector = useCallback(() => setShowSelector(true), []);
  const closeSelector = useCallback(() => setShowSelector(false), []);

  const handleSelectDino = useCallback((speciesId: number) => {
    const nextState = createInitialState(speciesId);

    commitState(nextState);
    setDebugSpeciesId(speciesId);
    setShowSelector(false);
    setFeedback("Egg secured. Keep watch.");
    setJustChangedStage(false);
    setJustHatched(false);
  }, [commitState]);

  const handleDebugSwitch = useCallback(() => {
    if (!debugEnabled || !debugSpeciesId) {
      return;
    }

    handleSelectDino(debugSpeciesId);
    setFeedback(`Debug switch: ${dinos.find((dino) => dino.id === debugSpeciesId)?.name ?? formatDexNumber(debugSpeciesId)}`);
  }, [debugEnabled, debugSpeciesId, dinos, handleSelectDino]);

  const handleAction = useCallback((action: TamagotchiAction) => {
    const current = stateRef.current;
    if (!current || isActing) {
      return;
    }

    setIsActing(true);
    const actionTime = Date.now();
    const nextState = applyPlayerAction(current, action, actionTime);
    const actionApplied = didActionApply(nextState, action, actionTime);

    setJustHatched(current.stage === "egg" && nextState.stage !== "egg");
    setJustChangedStage(current.stage !== nextState.stage && current.stage !== "egg");
    commitState(nextState);
    setFeedback(actionApplied ? getActionFeedback(action) : null);

    window.setTimeout(() => setFeedback(null), 2200);
    window.setTimeout(() => {
      setJustHatched(false);
      setJustChangedStage(false);
      setIsActing(false);
    }, 500);
  }, [commitState, isActing]);

  const handleResetRun = useCallback(() => {
    resetCurrentRun();
    stateRef.current = null;
    setState(null);
    setFeedback(null);
    setShowSelector(false);
  }, []);

  const handleSkipIncubation = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.stage !== "egg") {
      return;
    }

    const nextState = skipIncubation(current, Date.now());
    if (nextState === current) {
      return;
    }

    commitState(nextState);
    setJustChangedStage(false);
    setJustHatched(true);
    setFeedback("Incubation skipped.");

    window.setTimeout(() => setFeedback(null), 2200);
    window.setTimeout(() => setJustHatched(false), 500);
  }, [commitState]);

  const handleClearProgress = useCallback(() => {
    clearAllProgress();
    const clearedMeta = loadMetaProgression();
    stateRef.current = null;
    metaRef.current = clearedMeta;
    setMeta(clearedMeta);
    setState(null);
    setFeedback(null);
    setShowSelector(false);
  }, []);

  if (!state || !currentDino) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2d6,transparent_35%),linear-gradient(180deg,#fff9ee_0%,#fff3dc_100%)]">
        <header className="border-b border-border-default/80 bg-cream/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[860px] items-center justify-between px-4">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "px-0 text-text-secondary hover:bg-transparent hover:text-accent active:bg-transparent",
              })}
            >
              ← Home
            </Link>
            <h1 className="font-display text-lg font-bold text-text-primary">Dino Care</h1>
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-text-muted">Pocket Pet</span>
          </div>
        </header>

        <main id="main-content" className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[860px] flex-col justify-center px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.25rem] border border-white/65 bg-white/70 p-6 shadow-[0_30px_80px_rgba(28,25,23,0.12)] backdrop-blur"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-text-muted">Device boot</p>
              <h2 className="mt-3 font-display text-4xl font-black text-text-primary">Adopt a dinosaur egg</h2>
              <p className="mt-4 max-w-lg font-body text-sm leading-7 text-text-secondary">
                This is the stricter care mode. Your dino tracks sleep, sickness, mess, discipline, and attention debt
                even while you are away. Raise one companion well and unlock stronger branches for future runs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={openSelector}
                  variant="default"
                  size="lg"
                  className="font-display font-bold motion-safe:hover:-translate-y-0.5"
                >
                  Choose Your Dino
                </Button>
                <Button
                  onClick={openSelector}
                  variant="outline"
                  size="lg"
                  className="bg-white"
                >
                  Browse Hatchery
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Real-time catch-up with softer web pacing",
                  "Branching forms from good or rough care",
                  "Sleep, sickness, mess, and discipline pressure",
                  "Unlock history persists between runs",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border-default/70 bg-[#fff8ed] px-4 py-3 font-body text-sm text-text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: 0.05 }}
              className="rounded-[2.5rem] border border-stone-900/10 bg-[linear-gradient(180deg,#ffd89c_0%,#f4b860_100%)] p-5 shadow-[0_30px_80px_rgba(217,119,6,0.2)]"
            >
              <div className="rounded-[2rem] border border-white/45 bg-[#f7f4ee] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Sleep</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Sick</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Mess</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Attention</span>
                </div>
                <div className="flex items-center justify-center rounded-[1.75rem] border border-border-default bg-[linear-gradient(180deg,#f9fbff_0%,#e6edf8_100%)] p-6">
                  <div className="text-[8rem]">🥚</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {["Feed", "Play", "Clean", "Medicine", "Lights", "Discipline"].map((item) => (
                    <div key={item} className="rounded-2xl border border-stone-900/8 bg-white px-3 py-4 text-center font-display text-sm font-bold text-text-primary shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>
        </main>

        <DinoSelector dinos={dinos} isOpen={showSelector} onSelect={handleSelectDino} onClose={closeSelector} />
      </div>
    );
  }

  const isEgg = state.stage === "egg";
  const eggProgress = getHatchProgress(state);
  const animationState = getTamagotchiAnimationState(state);
  const moodMessage = isEgg ? `${currentDino.name}'s egg is incubating.` : getMoodMessage(mood, currentDino.name);
  const statusHeadline = getStatusHeadline(state.attentionReason, currentDino.name);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2d6,transparent_35%),linear-gradient(180deg,#fff9ee_0%,#fff3dc_100%)]">
      <header className="border-b border-border-default/80 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-4">
          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "px-0 text-text-secondary hover:bg-transparent hover:text-accent active:bg-transparent",
            })}
          >
            ← Home
          </Link>
          <h1 className="font-display text-lg font-bold text-text-primary">Dino Care</h1>
          <Button
            onClick={openSelector}
            variant="ghost"
            size="sm"
            className="text-xs uppercase tracking-[0.2em] text-text-muted hover:text-accent"
          >
            Hatchery
          </Button>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-[960px] px-4 py-6">
        <div
          className="rounded-[2.75rem] border-2 border-stone-900/18 p-5 shadow-[0_40px_90px_rgba(217,119,6,0.16)] dex-stripes"
          style={{
            background: `linear-gradient(160deg, ${shellAccent.light} 0%, #f8cd75 42%, ${stageColor.bg} 100%)`,
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-stone-900/10 bg-[#fff8ea]/75 px-4 py-3 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Run active</p>
              <h2 className="font-display text-xl font-black text-text-primary">
                {currentDino.name} {formatDexNumber(currentDino.id)}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Branch</p>
              <p className="font-display text-sm font-bold capitalize text-text-primary">{state.branchKey}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[2.2rem] border border-white/65 bg-white/62 p-4 backdrop-blur">
              <DinoAvatar
                attentionReason={state.attentionReason}
                animationState={animationState}
                dinoId={currentDino.id}
                dinoName={currentDino.name}
                eggProgress={eggProgress}
                eggVariantSeed={state.eggVariantSeed}
                era={currentDino.era}
                lastAction={state.lastAction}
                mood={mood}
                poopCount={state.poopCount}
                sick={state.sick}
                sleeping={state.sleeping}
                stage={state.stage}
              />

              <div className="mt-4 rounded-[1.6rem] border border-border-default bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-text-primary">{statusHeadline}</p>
                    <p className="mt-1 font-body text-sm text-text-secondary">{moodMessage}</p>
                  </div>
                  <span
                    className="rounded-pill px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white"
                    style={{ backgroundColor: stageColor.primary }}
                  >
                    {state.stage}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {feedback ? (
                    <motion.p
                      key={feedback}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-3 rounded-2xl bg-stone-950 px-3 py-2 font-body text-sm text-white"
                    >
                      {feedback}
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {justHatched ? (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-2xl bg-stage-hatchling/15 px-3 py-2 font-body text-sm text-text-primary"
                    >
                      The egg cracked open. Your hatchling is alive.
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {justChangedStage ? (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 rounded-2xl bg-accent/10 px-3 py-2 font-body text-sm text-text-primary"
                    >
                      Growth branch advanced. Care quality is shaping the next form.
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </section>

            <section className="rounded-[2.2rem] border border-white/65 bg-white/62 p-4 backdrop-blur">
              <div className="rounded-[1.75rem] border border-stone-900/8 bg-[linear-gradient(180deg,#fffaf0_0%,#fff2d2_100%)] p-4 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Pixel shell</p>
                    <h3 className="font-display text-lg font-bold text-text-primary">Vitals and controls</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Care quality</p>
                    <p className="font-display text-xl font-black text-text-primary">{state.careQuality}%</p>
                  </div>
                </div>

                {isEgg ? (
                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-border-default bg-[#fbfcff] p-5">
                      <EggCountdown
                        dinoName={currentDino.name}
                        speciesId={currentDino.id}
                        eggVariantSeed={state.eggVariantSeed}
                        progress={eggProgress}
                        timeRemainingMs={getHatchTimeRemaining(state)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSkipIncubation}
                      className="w-full rounded-[1.4rem] border border-dashed border-accent/35 bg-accent/10 px-4 py-3 text-left transition-colors hover:bg-accent/15"
                    >
                      <span className="block font-display text-sm font-bold text-text-primary">Skip incubation</span>
                      <span className="mt-1 block font-body text-xs leading-5 text-text-secondary">
                        Testing shortcut. Hatch this egg immediately without waiting for the timer.
                      </span>
                    </button>
                    <ActionButtons disabled={isActing || state.runStatus !== "active"} isEgg={isEgg} onAction={handleAction} />
                  </div>
                ) : (
                  <>
                    <StatBars stats={state.stats} />
                    <div className="mt-4">
                      <ActionButtons disabled={isActing || state.runStatus !== "active"} isEgg={isEgg} onAction={handleAction} />
                    </div>
                  </>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border-default/80 bg-[#fff8ed] p-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Status board</p>
                    <div className="mt-2 space-y-1.5 font-body text-sm text-text-secondary">
                      <p>Sleep: {state.sleeping ? "On" : "Awake"}</p>
                      <p>Sick: {state.sick ? "Yes" : "No"}</p>
                      <p>Mess: {state.poopCount > 0 ? `${state.poopCount} pile(s)` : "Clear"}</p>
                      <p>Attention: {state.attentionReason ?? "Calm"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-default/80 bg-[#fff8ed] p-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Run metrics</p>
                    <div className="mt-2 space-y-1.5 font-body text-sm text-text-secondary">
                      <p>Mistakes: {state.careMistakes}</p>
                      <p>Growth: {getNextEvolutionProgress(state)}%</p>
                      <p>Unlocks: {meta?.unlockedSpeciesIds.length ?? 0}</p>
                      <p>Branch: {state.branchKey}</p>
                    </div>
                  </div>
                </div>

                {state.runStatus !== "active" ? (
                  <div className="mt-4 rounded-[1.6rem] border border-rose-200 bg-rose-50 p-4">
                    <p className="font-display text-lg font-bold text-rose-900">This run has collapsed.</p>
                    <p className="mt-1 font-body text-sm text-rose-800">
                      Your unlock history stays, but this pet needs to be reset into a fresh egg.
                    </p>
                    <Button
                      onClick={handleResetRun}
                      variant="danger"
                      size="md"
                      className="mt-3 bg-rose-600 text-white hover:border-rose-700 hover:bg-rose-700 hover:text-white active:bg-rose-800"
                    >
                      Reset current run
                    </Button>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={openSelector}
              variant="outline"
              size="md"
              className="bg-white"
            >
              Open Hatchery
            </Button>
            <Button
              onClick={handleResetRun}
              variant="outline"
              size="md"
              className="bg-white"
            >
              Reset Run
            </Button>
            <Button
              onClick={handleClearProgress}
              variant="danger"
              size="md"
            >
              Clear All Progress
            </Button>
          </div>

          {debugEnabled ? (
            <div className="mt-4 rounded-[1.5rem] border border-dashed border-accent/30 bg-white/70 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">Debug</p>
                  <p className="font-body text-sm text-text-secondary">Switch the active dinosaur instantly for sprite validation.</p>
                </div>
                <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                  <label className="sr-only" htmlFor="debug-dino-switcher">
                    Debug dino switcher
                  </label>
                  <select
                    id="debug-dino-switcher"
                    name="debug-dino-switcher"
                    value={debugSpeciesId ?? ""}
                    onChange={(event) => setDebugSpeciesId(Number(event.target.value))}
                    className="min-w-[220px] rounded-pill border border-border-default bg-white px-4 py-2.5 font-body text-sm text-text-primary"
                  >
                    {dinos.map((dino) => (
                      <option key={dino.id} value={dino.id}>
                        {formatDexNumber(dino.id)} {dino.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleDebugSwitch}
                    variant="outline"
                    size="md"
                    className="border-accent/35 bg-accent/10 font-display font-bold text-text-primary"
                  >
                    Switch Dino
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <DinoSelector dinos={dinos} isOpen={showSelector} onSelect={handleSelectDino} onClose={closeSelector} />
    </div>
  );
}
