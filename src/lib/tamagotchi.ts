import type { Stage } from "./types";
import { DINO_HATCH_TIMES, DEFAULT_HATCH_TIME } from "./constants";

export type TamagotchiStage = "egg" | Stage;

export interface TamagotchiStats {
  hunger: number;   // 0-100
  happiness: number; // 0-100
  energy: number;   // 0-100
}

export interface TamagotchiState {
  dinoId: number;
  stage: TamagotchiStage;
  stats: TamagotchiStats;
  careScore: number;
  totalInteractions: number;
  lastAction: string | null;
  lastActionTime: number;
  eggStartTime: number | null;
  hatchDurationMs: number | null;
}

export type TamagotchiAction = "feed" | "play" | "sleep";

export type Mood = "ecstatic" | "happy" | "neutral" | "sad" | "critical";

const EVOLUTION_THRESHOLD = 30; // interactions needed to evolve
const DECAY_AMOUNT = 3; // stats decay per action

export function createInitialState(dinoId: number): TamagotchiState {
  const hatchDuration = DINO_HATCH_TIMES[dinoId] ?? DEFAULT_HATCH_TIME;
  return {
    dinoId,
    stage: "egg",
    stats: { hunger: 50, happiness: 50, energy: 50 },
    careScore: 0,
    totalInteractions: 0,
    lastAction: null,
    lastActionTime: Date.now(),
    eggStartTime: Date.now(),
    hatchDurationMs: hatchDuration,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applyDecay(stats: TamagotchiStats): TamagotchiStats {
  return {
    hunger: clamp(stats.hunger - DECAY_AMOUNT, 0, 100),
    happiness: clamp(stats.happiness - DECAY_AMOUNT, 0, 100),
    energy: clamp(stats.energy - DECAY_AMOUNT, 0, 100),
  };
}

export function applyAction(state: TamagotchiState, action: TamagotchiAction): TamagotchiState {
  if (state.stage === "egg") return state;

  // First apply decay to simulate time passing
  const decayed = applyDecay(state.stats);

  let newStats: TamagotchiStats;

  switch (action) {
    case "feed":
      newStats = {
        hunger: clamp(decayed.hunger + 25, 0, 100),
        happiness: clamp(decayed.happiness + 5, 0, 100),
        energy: clamp(decayed.energy + 3, 0, 100),
      };
      break;
    case "play":
      newStats = {
        hunger: clamp(decayed.hunger - 5, 0, 100),
        happiness: clamp(decayed.happiness + 25, 0, 100),
        energy: clamp(decayed.energy - 10, 0, 100),
      };
      break;
    case "sleep":
      newStats = {
        hunger: clamp(decayed.hunger - 5, 0, 100),
        happiness: clamp(decayed.happiness - 3, 0, 100),
        energy: clamp(decayed.energy + 30, 0, 100),
      };
      break;
  }

  const avg = (newStats.hunger + newStats.happiness + newStats.energy) / 3;
  const careBonus = avg > 70 ? 2 : avg > 40 ? 1 : 0;
  const newCareScore = state.careScore + careBonus;
  const newInteractions = state.totalInteractions + 1;

  // Check evolution
  let newStage = state.stage;
  if (state.stage === "hatchling" && newInteractions >= EVOLUTION_THRESHOLD && newCareScore >= 20) {
    newStage = "juvenile";
  } else if (state.stage === "juvenile" && newInteractions >= EVOLUTION_THRESHOLD * 2 && newCareScore >= 50) {
    newStage = "adult";
  }

  return {
    ...state,
    stats: newStats,
    careScore: newCareScore,
    totalInteractions: newInteractions,
    stage: newStage,
    lastAction: action,
    lastActionTime: Date.now(),
  };
}

export function getMood(stats: TamagotchiStats): Mood {
  const avg = (stats.hunger + stats.happiness + stats.energy) / 3;
  if (avg >= 85) return "ecstatic";
  if (avg >= 65) return "happy";
  if (avg >= 40) return "neutral";
  if (avg >= 20) return "sad";
  return "critical";
}

export function getMoodEmoji(mood: Mood): string {
  switch (mood) {
    case "ecstatic": return "✨";
    case "happy": return "😊";
    case "neutral": return "😐";
    case "sad": return "😢";
    case "critical": return "😵";
  }
}

export function getMoodMessage(mood: Mood, dinoName: string): string {
  switch (mood) {
    case "ecstatic": return `${dinoName} is absolutely thriving!`;
    case "happy": return `${dinoName} is feeling great!`;
    case "neutral": return `${dinoName} is doing okay.`;
    case "sad": return `${dinoName} needs some attention...`;
    case "critical": return `${dinoName} is in danger! Help quick!`;
  }
}

export function checkHatch(state: TamagotchiState): TamagotchiState {
  if (state.stage !== "egg" || !state.eggStartTime || !state.hatchDurationMs) {
    return state;
  }
  const elapsed = Date.now() - state.eggStartTime;
  if (elapsed >= state.hatchDurationMs) {
    return {
      ...state,
      stage: "hatchling",
      stats: { hunger: 60, happiness: 60, energy: 60 },
      eggStartTime: null,
      hatchDurationMs: null,
    };
  }
  return state;
}

export function getHatchProgress(state: TamagotchiState): number {
  if (state.stage !== "egg" || !state.eggStartTime || !state.hatchDurationMs) return 100;
  const elapsed = Date.now() - state.eggStartTime;
  return Math.min(100, (elapsed / state.hatchDurationMs) * 100);
}

export function getHatchTimeRemaining(state: TamagotchiState): number {
  if (state.stage !== "egg" || !state.eggStartTime || !state.hatchDurationMs) return 0;
  return Math.max(0, state.hatchDurationMs - (Date.now() - state.eggStartTime));
}

export function getNextEvolutionProgress(state: TamagotchiState): number {
  if (state.stage === "egg") return 0;
  if (state.stage === "adult") return 100;

  const threshold = state.stage === "hatchling" ? EVOLUTION_THRESHOLD : EVOLUTION_THRESHOLD * 2;
  return Math.min(100, Math.round((state.totalInteractions / threshold) * 100));
}

export function getActionFeedback(action: TamagotchiAction): string {
  switch (action) {
    case "feed": return "Nom nom nom! 🍖";
    case "play": return "Wheee! So fun! 🎮";
    case "sleep": return "Zzz... sweet dreams 😴";
  }
}

const STORAGE_KEY = "dinodex-tamagotchi";

export function saveState(state: TamagotchiState): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadState(): TamagotchiState | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<TamagotchiState>;
    // Migration: add egg fields if missing (pre-egg-feature saves)
    return {
      ...parsed,
      eggStartTime: parsed.eggStartTime ?? null,
      hatchDurationMs: parsed.hatchDurationMs ?? null,
    } as TamagotchiState;
  } catch {
    return null;
  }
}

export function clearState(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
