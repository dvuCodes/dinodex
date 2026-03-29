import { beforeEach, describe, expect, test } from "bun:test";
import * as tamagotchi from "./tamagotchi";

type UnknownFn = (...args: any[]) => any;

function getFunction(name: string): UnknownFn {
  const fn = (tamagotchi as Record<string, unknown>)[name];
  expect(typeof fn).toBe("function");
  return fn as UnknownFn;
}

function getValue<T>(name: string): T {
  return (tamagotchi as Record<string, unknown>)[name] as T;
}

const loadState = () => getFunction("loadState");
const saveState = () => getFunction("saveState");
const loadMetaProgression = () => getFunction("loadMetaProgression");
const saveMetaProgression = () => getFunction("saveMetaProgression");
const createInitialState = () => getFunction("createInitialState");
const simulateElapsedTime = () => getFunction("simulateElapsedTime");
const applyPlayerAction = () => getFunction("applyPlayerAction");
const resetCurrentRun = () => getFunction("resetCurrentRun");
const clearAllProgress = () => getFunction("clearAllProgress");
const evaluateStageGate = () => getFunction("evaluateStageGate");
const STORAGE_KEY = () => getValue<string>("STORAGE_KEY");
const META_STORAGE_KEY = () => getValue<string>("META_STORAGE_KEY");

const memoryStorage = (() => {
  let store = new Map<string, string>();

  return {
    clear() {
      store = new Map<string, string>();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    get length() {
      return store.size;
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: memoryStorage,
  configurable: true,
});

describe("tamagotchi storage and migration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("migrates the legacy save shape into a versioned simulation state", () => {
    localStorage.setItem(
      "dinodex-tamagotchi",
      JSON.stringify({
        dinoId: 18,
        stage: "egg",
        stats: { hunger: 50, happiness: 50, energy: 50 },
        careScore: 3,
        totalInteractions: 10,
        lastAction: "feed",
        lastActionTime: 1_000,
        eggStartTime: 500,
        hatchDurationMs: 5_000,
      })
    );

    const state = loadState()();

    expect(state).not.toBeNull();
    expect(state.version).toBeGreaterThanOrEqual(1);
    expect(state.speciesId).toBe(18);
    expect(state.stats.cleanliness).toBeGreaterThanOrEqual(0);
    expect(state.stats.health).toBeGreaterThanOrEqual(0);
    expect(state.stats.discipline).toBeGreaterThanOrEqual(0);
    expect(state.lastSimulatedAt).toBeTypeOf("number");
  });

  test("round-trips a versioned run and separate meta progression", () => {
    const state = createInitialState()(7);
    const meta = {
      version: 1,
      unlockedSpeciesIds: [7, 18],
      discoveredBranches: ["ideal", "rough"],
      bestCareQualityBySpecies: { 7: 92 },
    };

    saveState()(state);
    saveMetaProgression()(meta);

    expect(loadState()()).toEqual(state);
    expect(loadMetaProgression()()).toEqual(meta);
  });

  test("clear all progression removes both the run and meta saves", () => {
    saveState()(createInitialState()(3));
    saveMetaProgression()({
      version: 1,
      unlockedSpeciesIds: [3],
      discoveredBranches: ["ideal"],
      bestCareQualityBySpecies: { 3: 88 },
    });

    clearAllProgress()();

    expect(localStorage.getItem(STORAGE_KEY())).toBeNull();
    expect(localStorage.getItem(META_STORAGE_KEY())).toBeNull();
  });

  test("reset current run clears only the active run", () => {
    saveState()(createInitialState()(9));
    saveMetaProgression()({
      version: 1,
      unlockedSpeciesIds: [9],
      discoveredBranches: ["ideal"],
      bestCareQualityBySpecies: { 9: 94 },
    });

    resetCurrentRun()();

    expect(localStorage.getItem(STORAGE_KEY())).toBeNull();
    expect(loadMetaProgression()()).toEqual({
      version: 1,
      unlockedSpeciesIds: [9],
      discoveredBranches: ["ideal"],
      bestCareQualityBySpecies: { 9: 94 },
    });
  });
});

describe("tamagotchi simulation", () => {
  test("offline reconciliation hatches the egg exactly once when enough time passes", () => {
    const state = createInitialState()(18);
    const future = state.eggStartTime + state.hatchDurationMs + 1_000;

    const reconciled = simulateElapsedTime()(state, future);

    expect(reconciled.stage).toBe("hatchling");
    expect(reconciled.eggStartTime).toBeNull();
    expect(reconciled.hatchDurationMs).toBeNull();
    expect(reconciled.lastSimulatedAt).toBe(future);
  });

  test("offline reconciliation accumulates mess and attention debt without impossible negatives", () => {
    const base = createInitialState()(6);
    const hatched = simulateElapsedTime()(base, base.eggStartTime + base.hatchDurationMs + 1_000);
    const neglected = {
      ...hatched,
      sleeping: false,
      lastSimulatedAt: hatched.lastSimulatedAt,
    };

    const reconciled = simulateElapsedTime()(neglected, neglected.lastSimulatedAt + 1000 * 60 * 60 * 24);

    expect(reconciled.poopCount).toBeGreaterThan(0);
    expect(reconciled.attention).toBe(true);
    expect(reconciled.careMistakes).toBeGreaterThan(0);
    expect(reconciled.stats.hunger).toBeGreaterThanOrEqual(0);
    expect(reconciled.stats.energy).toBeGreaterThanOrEqual(0);
    expect(reconciled.stats.cleanliness).toBeGreaterThanOrEqual(0);
  });

  test("cleaning removes mess and improves cleanliness", () => {
    const dirtyState = {
      ...createInitialState()(4),
      stage: "juvenile",
      stats: {
        hunger: 60,
        happiness: 55,
        energy: 50,
        cleanliness: 10,
        health: 70,
        discipline: 45,
      },
      poopCount: 2,
      attention: true,
      attentionReason: "mess",
      lastSimulatedAt: 10_000,
    };

    const cleaned = applyPlayerAction()(dirtyState, "clean", 11_000);

    expect(cleaned.poopCount).toBe(0);
    expect(cleaned.stats.cleanliness).toBeGreaterThan(dirtyState.stats.cleanliness);
  });

  test("disciplining a false alarm improves discipline and resolves the alert", () => {
    const needyState = {
      ...createInitialState()(20),
      stage: "hatchling",
      stats: {
        hunger: 85,
        happiness: 80,
        energy: 75,
        cleanliness: 90,
        health: 85,
        discipline: 30,
      },
      attention: true,
      attentionReason: "discipline",
      lastSimulatedAt: 5_000,
    };

    const disciplined = applyPlayerAction()(needyState, "discipline", 6_000);

    expect(disciplined.attention).toBe(false);
    expect(disciplined.stats.discipline).toBeGreaterThan(needyState.stats.discipline);
    expect(disciplined.careMistakes).toBe(needyState.careMistakes);
  });

  test("stage gates branch deterministically from care quality", () => {
    const idealState = {
      ...createInitialState()(18),
      stage: "hatchling",
      ageMs: 1000 * 60 * 60 * 10,
      careQuality: 95,
      careMistakes: 0,
      stats: {
        hunger: 90,
        happiness: 92,
        energy: 88,
        cleanliness: 94,
        health: 96,
        discipline: 85,
      },
    };

    const roughState = {
      ...idealState,
      careQuality: 28,
      careMistakes: 8,
      stats: {
        hunger: 25,
        happiness: 32,
        energy: 20,
        cleanliness: 18,
        health: 30,
        discipline: 15,
      },
    };

    const idealOutcome = evaluateStageGate()(idealState, idealState.lastSimulatedAt + 1_000);
    const roughOutcome = evaluateStageGate()(roughState, roughState.lastSimulatedAt + 1_000);

    expect(idealOutcome.stage).toBe("juvenile");
    expect(idealOutcome.branchKey).toBe("ideal");
    expect(roughOutcome.stage).toBe("juvenile");
    expect(roughOutcome.branchKey).toBe("rough");
  });
});
