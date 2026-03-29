import type { Stage } from "./types";
import { DINO_HATCH_TIMES, DEFAULT_HATCH_TIME } from "./constants";

export const STORAGE_KEY = "dinodex-tamagotchi";
export const META_STORAGE_KEY = "dinodex-tamagotchi-meta";
export const CURRENT_VERSION = 1;

const MAX_STAT = 100;
const MIN_STAT = 0;
const HOUR_MS = 3_600_000;
const DECAY_WINDOW_MS = 4 * HOUR_MS;
const POOP_WINDOW_MS = 8 * HOUR_MS;
const HATCHLING_MIN_AGE_MS = 8 * HOUR_MS;
const JUVENILE_MIN_AGE_MS = 20 * HOUR_MS;
const SLEEP_START_HOUR = 22;
const SLEEP_END_HOUR = 7;

export type TamagotchiStage = "egg" | Stage;
export type TamagotchiBranchKey = "ideal" | "steady" | "rough";
export type TamagotchiRunStatus = "active" | "soft-failed";

export type TamagotchiAction =
  | "feed"
  | "snack"
  | "play"
  | "clean"
  | "medicine"
  | "lights"
  | "discipline"
  | "status"
  | "sleep";

export type TamagotchiAttentionReason =
  | "hunger"
  | "energy"
  | "happiness"
  | "mess"
  | "health"
  | "sleep"
  | "discipline";
export type AttentionReason = TamagotchiAttentionReason;
export type BranchKey = TamagotchiBranchKey;
export type RunStatus = TamagotchiRunStatus;

export interface TamagotchiStats {
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  health: number;
  discipline: number;
}

export interface TamagotchiState {
  version: number;
  speciesId: number;
  dinoId: number;
  stage: TamagotchiStage;
  stats: TamagotchiStats;
  ageMs: number;
  lastSimulatedAt: number;
  lastAction: TamagotchiAction | null;
  lastActionTime: number;
  sleeping: boolean;
  attention: boolean;
  attentionReason: TamagotchiAttentionReason | null;
  sick: boolean;
  poopCount: number;
  careMistakes: number;
  careQuality: number;
  branchKey: TamagotchiBranchKey | null;
  runStatus: TamagotchiRunStatus;
  eggStartTime: number | null;
  hatchDurationMs: number | null;
}

export interface TamagotchiMetaProgression {
  version: number;
  unlockedSpeciesIds: number[];
  discoveredBranches: TamagotchiBranchKey[];
  bestCareQualityBySpecies: Record<number, number>;
}

type LegacyState = {
  dinoId: number;
  stage: TamagotchiStage;
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
  };
  careScore: number;
  totalInteractions: number;
  lastAction: string | null;
  lastActionTime: number;
  eggStartTime: number | null;
  hatchDurationMs: number | null;
};

export type Mood = "ecstatic" | "happy" | "neutral" | "sad" | "critical";

const INITIAL_HATCHLING_STATS: TamagotchiStats = {
  hunger: 72,
  happiness: 76,
  energy: 70,
  cleanliness: 82,
  health: 86,
  discipline: 58,
};

const INITIAL_ACTIVE_STATS: TamagotchiStats = {
  hunger: 68,
  happiness: 72,
  energy: 66,
  cleanliness: 80,
  health: 84,
  discipline: 52,
};

function hasStorage(): boolean {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis;
}

export function clamp(value: number, min = MIN_STAT, max = MAX_STAT): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function deriveCareQuality(stats: TamagotchiStats, careMistakes: number, sick: boolean, poopCount: number): number {
  const base = average([
    stats.hunger,
    stats.happiness,
    stats.energy,
    stats.cleanliness,
    stats.health,
    stats.discipline,
  ]);

  const penalties = careMistakes * 4 + poopCount * 5 + (sick ? 12 : 0);
  return clamp(base - penalties);
}

function createMetaProgression(): TamagotchiMetaProgression {
  return {
    version: CURRENT_VERSION,
    unlockedSpeciesIds: [],
    discoveredBranches: [],
    bestCareQualityBySpecies: {},
  };
}

export function createInitialState(speciesId: number, now = Date.now()): TamagotchiState {
  const hatchDuration = DINO_HATCH_TIMES[speciesId] ?? DEFAULT_HATCH_TIME;

  return {
    version: CURRENT_VERSION,
    speciesId,
    dinoId: speciesId,
    stage: "egg",
    stats: { ...INITIAL_ACTIVE_STATS },
    ageMs: 0,
    lastSimulatedAt: now,
    lastAction: null,
    lastActionTime: now,
    sleeping: false,
    attention: false,
    attentionReason: null,
    sick: false,
    poopCount: 0,
    careMistakes: 0,
    careQuality: 70,
    branchKey: null,
    runStatus: "active",
    eggStartTime: now,
    hatchDurationMs: hatchDuration,
  };
}

function isVersionedState(value: unknown): value is TamagotchiState {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as TamagotchiState).version === "number" &&
      typeof (value as TamagotchiState).speciesId === "number" &&
      typeof (value as TamagotchiState).lastSimulatedAt === "number"
  );
}

function isLegacyState(value: unknown): value is LegacyState {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as LegacyState).dinoId === "number" &&
      typeof (value as LegacyState).stage === "string" &&
      typeof (value as LegacyState).lastActionTime === "number"
  );
}

function migrateLegacyState(legacy: LegacyState): TamagotchiState {
  const migratedStats: TamagotchiStats = {
    hunger: clamp(legacy.stats.hunger),
    happiness: clamp(legacy.stats.happiness),
    energy: clamp(legacy.stats.energy),
    cleanliness: 64,
    health: 76,
    discipline: 54,
  };

  return {
    version: CURRENT_VERSION,
    speciesId: legacy.dinoId,
    dinoId: legacy.dinoId,
    stage: legacy.stage,
    stats: migratedStats,
    ageMs: legacy.stage === "egg" ? 0 : legacy.totalInteractions * 20 * 60 * 1000,
    lastSimulatedAt: legacy.lastActionTime,
    lastAction: normalizeLegacyAction(legacy.lastAction),
    lastActionTime: legacy.lastActionTime,
    sleeping: false,
    attention: false,
    attentionReason: null,
    sick: false,
    poopCount: 0,
    careMistakes: clamp(legacy.totalInteractions - legacy.careScore, 0, 100),
    careQuality: deriveCareQuality(migratedStats, clamp(legacy.totalInteractions - legacy.careScore, 0, 100), false, 0),
    branchKey: null,
    runStatus: "active",
    eggStartTime: legacy.eggStartTime,
    hatchDurationMs: legacy.hatchDurationMs,
  };
}

function normalizeLegacyAction(action: string | null): TamagotchiAction | null {
  if (!action) return null;
  if (action === "sleep") return "sleep";
  if (action === "feed" || action === "play") return action;
  return null;
}

function parseStoredState(raw: string | null): TamagotchiState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isVersionedState(parsed)) {
      return parsed;
    }

    if (isLegacyState(parsed)) {
      return migrateLegacyState(parsed);
    }

    return null;
  } catch {
    return null;
  }
}

function setMetaProgression(meta: TamagotchiMetaProgression): void {
  if (!hasStorage()) return;
  globalThis.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
}

function resolveAttentionReason(state: TamagotchiState): TamagotchiAttentionReason | null {
  if (state.sick || state.stats.health <= 35) return "health";
  if (state.poopCount > 0 || state.stats.cleanliness <= 35) return "mess";
  if (state.stats.hunger <= 30) return "hunger";
  if (state.stats.energy <= 25) return "energy";
  if (state.stats.happiness <= 30) return "happiness";
  return null;
}

function getBranchKeyForQuality(careQuality: number): TamagotchiBranchKey {
  if (careQuality >= 80) return "ideal";
  if (careQuality >= 45) return "steady";
  return "rough";
}

function getMinAgeForStage(stage: TamagotchiStage): number {
  if (stage === "hatchling") return HATCHLING_MIN_AGE_MS;
  if (stage === "juvenile") return JUVENILE_MIN_AGE_MS;
  return 0;
}

function applyDecayWindow(state: TamagotchiState): TamagotchiState {
  const nextStats: TamagotchiStats = {
    hunger: clamp(state.stats.hunger - 8),
    happiness: clamp(state.stats.happiness - 6),
    energy: clamp(state.sleeping ? state.stats.energy + 5 : state.stats.energy - 7),
    cleanliness: clamp(state.stats.cleanliness - (state.poopCount > 0 ? 9 : 5)),
    health: clamp(state.stats.health - (state.sick ? 7 : state.stats.cleanliness <= 30 ? 4 : 1)),
    discipline: clamp(state.stats.discipline - 2),
  };

  return {
    ...state,
    stats: nextStats,
  };
}

function applyPoop(state: TamagotchiState, count: number): TamagotchiState {
  if (count <= 0) return state;

  return {
    ...state,
    poopCount: state.poopCount + count,
    stats: {
      ...state.stats,
      cleanliness: clamp(state.stats.cleanliness - count * 8),
      health: clamp(state.stats.health - count * 3),
    },
  };
}

function inSleepWindow(timestamp: number): boolean {
  const hour = new Date(timestamp).getHours();
  return hour >= SLEEP_START_HOUR || hour < SLEEP_END_HOUR;
}

function applySleepConsequences(state: TamagotchiState, now: number, elapsed: number): TamagotchiState {
  if (!inSleepWindow(now) || state.sleeping || elapsed < HOUR_MS) {
    return state;
  }

  const violations = Math.max(1, Math.floor(elapsed / (8 * HOUR_MS)));

  return {
    ...state,
    attention: true,
    attentionReason: "sleep",
    careMistakes: state.careMistakes + violations,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy - 8 * violations),
      discipline: clamp(state.stats.discipline - 6 * violations),
      happiness: clamp(state.stats.happiness - 4 * violations),
    },
  };
}

function applyHealthConsequences(state: TamagotchiState): TamagotchiState {
  const shouldBeSick = state.sick || state.poopCount >= 2 || state.stats.cleanliness <= 20 || state.stats.health <= 30;

  if (!shouldBeSick) {
    return state;
  }

  return {
    ...state,
    sick: true,
    attention: true,
    attentionReason: state.attentionReason ?? "health",
    stats: {
      ...state.stats,
      health: clamp(state.stats.health - 6),
    },
  };
}

function recalculateDerivedState(state: TamagotchiState): TamagotchiState {
  const derivedAttentionReason = resolveAttentionReason(state);
  const attentionReason =
    derivedAttentionReason ??
    (state.attention && state.attentionReason === "discipline" ? "discipline" : state.attentionReason);
  const attention = state.attention || attentionReason !== null;
  const careQuality = deriveCareQuality(state.stats, state.careMistakes, state.sick, state.poopCount);

  return {
    ...state,
    attention,
    attentionReason,
    careQuality,
    runStatus: careQuality <= 20 || state.stats.health <= 10 ? "soft-failed" : "active",
  };
}

export function evaluateStageGate(state: TamagotchiState, now = Date.now()): TamagotchiState {
  if (state.stage === "egg" || state.stage === "adult") {
    return state;
  }

  const minAge = getMinAgeForStage(state.stage);

  if (state.ageMs < minAge) {
    return state;
  }

  const nextStage: TamagotchiStage = state.stage === "hatchling" ? "juvenile" : "adult";
  const branchKey = getBranchKeyForQuality(state.careQuality);

  return {
    ...state,
    stage: nextStage,
    branchKey,
    attention: false,
    attentionReason: null,
    stats: {
      ...state.stats,
      health: clamp(state.stats.health + 6),
      happiness: clamp(state.stats.happiness + 8),
    },
    lastSimulatedAt: now,
  };
}

function hatchEgg(state: TamagotchiState, hatchTime: number): TamagotchiState {
  return {
    ...state,
    stage: "hatchling",
    stats: { ...INITIAL_HATCHLING_STATS },
    ageMs: 0,
    eggStartTime: null,
    hatchDurationMs: null,
    lastSimulatedAt: hatchTime,
    attention: false,
    attentionReason: null,
    careQuality: 72,
  };
}

export function simulateElapsedTime(state: TamagotchiState, now = Date.now()): TamagotchiState {
  if (now <= state.lastSimulatedAt) {
    return recalculateDerivedState(state);
  }

  let current = { ...state };

  if (current.stage === "egg" && current.eggStartTime && current.hatchDurationMs) {
    const hatchTime = current.eggStartTime + current.hatchDurationMs;

    if (now >= hatchTime) {
      current = hatchEgg(current, hatchTime);
    } else {
      return {
        ...current,
        lastSimulatedAt: now,
      };
    }
  }

  const elapsed = now - current.lastSimulatedAt;
  const decaySteps = Math.floor(elapsed / DECAY_WINDOW_MS);
  const poopEvents = Math.floor(elapsed / POOP_WINDOW_MS);

  current = {
    ...current,
    ageMs: current.ageMs + elapsed,
    lastSimulatedAt: now,
    careMistakes: current.careMistakes + (poopEvents > 0 ? 1 : 0),
  };

  for (let step = 0; step < decaySteps; step += 1) {
    current = applyDecayWindow(current);
  }

  current = applyPoop(current, poopEvents);
  current = applySleepConsequences(current, now, elapsed);
  current = applyHealthConsequences(current);
  current = recalculateDerivedState(current);
  current = evaluateStageGate(current, now);
  current = recalculateDerivedState(current);

  return current;
}

export function applyPlayerAction(state: TamagotchiState, action: TamagotchiAction, now = Date.now()): TamagotchiState {
  let current = simulateElapsedTime(state, now);

  if (current.stage === "egg" && action !== "status") {
    return current;
  }

  const next = { ...current };
  const clearAttention = () => {
    next.attention = false;
    next.attentionReason = null;
  };

  switch (action) {
    case "feed":
      next.stats = {
        ...next.stats,
        hunger: clamp(next.stats.hunger + 24),
        happiness: clamp(next.stats.happiness + 4),
      };
      if (next.attentionReason === "hunger") clearAttention();
      break;
    case "snack":
      next.stats = {
        ...next.stats,
        hunger: clamp(next.stats.hunger + 8),
        happiness: clamp(next.stats.happiness + 14),
        discipline: clamp(next.stats.discipline - 2),
      };
      break;
    case "play":
      next.stats = {
        ...next.stats,
        happiness: clamp(next.stats.happiness + 18),
        energy: clamp(next.stats.energy - 12),
        hunger: clamp(next.stats.hunger - 6),
      };
      if (next.attentionReason === "happiness") clearAttention();
      break;
    case "clean":
      next.poopCount = 0;
      next.stats = {
        ...next.stats,
        cleanliness: clamp(next.stats.cleanliness + 32),
        health: clamp(next.stats.health + 4),
      };
      if (next.attentionReason === "mess") clearAttention();
      break;
    case "medicine":
      if (next.sick) {
        next.sick = false;
        next.stats = {
          ...next.stats,
          health: clamp(next.stats.health + 18),
          happiness: clamp(next.stats.happiness - 4),
        };
        if (next.attentionReason === "health") clearAttention();
      }
      break;
    case "lights":
    case "sleep":
      next.sleeping = !next.sleeping;
      next.stats = {
        ...next.stats,
        energy: clamp(next.stats.energy + (next.sleeping ? 14 : -2)),
      };
      if (next.attentionReason === "sleep") clearAttention();
      break;
    case "discipline":
      if (next.attentionReason === "discipline") {
        next.stats = {
          ...next.stats,
          discipline: clamp(next.stats.discipline + 18),
          happiness: clamp(next.stats.happiness - 2),
        };
        clearAttention();
      } else {
        next.stats = {
          ...next.stats,
          discipline: clamp(next.stats.discipline + 5),
          happiness: clamp(next.stats.happiness - 6),
        };
      }
      break;
    case "status":
      break;
  }

  next.lastAction = action;
  next.lastActionTime = now;

  const resolved = recalculateDerivedState(next);
  return evaluateStageGate(resolved, now);
}

export function applyAction(state: TamagotchiState, action: TamagotchiAction): TamagotchiState {
  return applyPlayerAction(state, action, Date.now());
}

export function getMood(stats: TamagotchiStats): Mood {
  const avg = average([
    stats.hunger,
    stats.happiness,
    stats.energy,
    stats.cleanliness,
    stats.health,
    stats.discipline,
  ]);

  if (avg >= 85) return "ecstatic";
  if (avg >= 65) return "happy";
  if (avg >= 45) return "neutral";
  if (avg >= 25) return "sad";
  return "critical";
}

export function getMoodEmoji(mood: Mood): string {
  switch (mood) {
    case "ecstatic":
      return "✨";
    case "happy":
      return "😊";
    case "neutral":
      return "😐";
    case "sad":
      return "😢";
    case "critical":
      return "😵";
  }
}

export function getMoodMessage(mood: Mood, dinoName: string): string {
  switch (mood) {
    case "ecstatic":
      return `${dinoName} is thriving.`;
    case "happy":
      return `${dinoName} feels well cared for.`;
    case "neutral":
      return `${dinoName} is holding steady.`;
    case "sad":
      return `${dinoName} needs attention soon.`;
    case "critical":
      return `${dinoName} is struggling badly.`;
  }
}

export function checkHatch(state: TamagotchiState): TamagotchiState {
  return simulateElapsedTime(state, Date.now());
}

export function getHatchProgress(state: TamagotchiState): number {
  if (state.stage !== "egg" || !state.eggStartTime || !state.hatchDurationMs) {
    return 100;
  }

  const elapsed = state.lastSimulatedAt - state.eggStartTime;
  return clamp((elapsed / state.hatchDurationMs) * 100, 0, 100);
}

export function getHatchTimeRemaining(state: TamagotchiState): number {
  if (state.stage !== "egg" || !state.eggStartTime || !state.hatchDurationMs) {
    return 0;
  }

  return Math.max(0, state.eggStartTime + state.hatchDurationMs - state.lastSimulatedAt);
}

export function getNextEvolutionProgress(state: TamagotchiState): number {
  if (state.stage === "egg") {
    return getHatchProgress(state);
  }

  if (state.stage === "adult") {
    return 100;
  }

  const minAge = getMinAgeForStage(state.stage);
  return clamp((state.ageMs / minAge) * 100, 0, 100);
}

export function getActionFeedback(action: TamagotchiAction): string {
  switch (action) {
    case "feed":
      return "Meal time.";
    case "snack":
      return "Treat delivered.";
    case "play":
      return "Playtime!";
    case "clean":
      return "Sparkling clean.";
    case "medicine":
      return "Medicine applied.";
    case "lights":
    case "sleep":
      return "Lights toggled.";
    case "discipline":
      return "Boundary set.";
    case "status":
      return "Vitals checked.";
  }
}

export function saveState(state: TamagotchiState): void {
  if (!hasStorage()) return;
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(): TamagotchiState | null {
  if (!hasStorage()) return null;
  return parseStoredState(globalThis.localStorage.getItem(STORAGE_KEY));
}

export function loadAndReconcileState(now = Date.now()): TamagotchiState | null {
  const stored = loadState();
  if (!stored) {
    return null;
  }

  const reconciled = simulateElapsedTime(stored, now);
  saveState(reconciled);
  return reconciled;
}

export function saveMetaProgression(meta: TamagotchiMetaProgression): void {
  setMetaProgression(meta);
}

export function loadMetaProgression(): TamagotchiMetaProgression {
  if (!hasStorage()) {
    return createMetaProgression();
  }

  const raw = globalThis.localStorage.getItem(META_STORAGE_KEY);
  if (!raw) {
    return createMetaProgression();
  }

  try {
    const parsed = JSON.parse(raw) as TamagotchiMetaProgression;

    return {
      version: parsed.version ?? CURRENT_VERSION,
      unlockedSpeciesIds: parsed.unlockedSpeciesIds ?? [],
      discoveredBranches: parsed.discoveredBranches ?? [],
      bestCareQualityBySpecies: parsed.bestCareQualityBySpecies ?? {},
    };
  } catch {
    return createMetaProgression();
  }
}

export function resetCurrentRun(): void {
  if (!hasStorage()) return;
  globalThis.localStorage.removeItem(STORAGE_KEY);
}

export function clearAllProgress(): void {
  if (!hasStorage()) return;
  globalThis.localStorage.removeItem(STORAGE_KEY);
  globalThis.localStorage.removeItem(META_STORAGE_KEY);
}

export function clearState(): void {
  resetCurrentRun();
}
