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
const reconcileMetaProgression = () => getFunction("reconcileMetaProgression");
const skipIncubation = () => getFunction("skipIncubation");
const evolveCurrentDino = () => getFunction("evolveCurrentDino");
const applyPlayerAction = () => getFunction("applyPlayerAction");
const didActionApply = () => getFunction("didActionApply");
const resetCurrentRun = () => getFunction("resetCurrentRun");
const clearAllProgress = () => getFunction("clearAllProgress");
const evaluateStageGate = () => getFunction("evaluateStageGate");
const getMood = () => getFunction("getMood");
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
  const HOUR_MS = 60 * 60 * 1000;

  test("preserves the egg seed until the hatch time is reached", () => {
    const state = createInitialState()(18, 10_000);
    const beforeHatch = state.eggStartTime + state.hatchDurationMs - 1_000;

    const reconciled = simulateElapsedTime()(state, beforeHatch);

    expect(reconciled.stage).toBe("egg");
    expect(reconciled.eggStartTime).toBe(state.eggStartTime);
    expect(reconciled.hatchDurationMs).toBe(state.hatchDurationMs);
    expect(reconciled.lastSimulatedAt).toBe(beforeHatch);
  });

  test("maps care stats into the mood buckets used by the avatar animation", () => {
    expect(
      getMood()({
        hunger: 100,
        happiness: 100,
        energy: 100,
        cleanliness: 100,
        health: 100,
        discipline: 100,
      })
    ).toBe("ecstatic");

    expect(
      getMood()({
        hunger: 70,
        happiness: 70,
        energy: 70,
        cleanliness: 70,
        health: 70,
        discipline: 70,
      })
    ).toBe("happy");

    expect(
      getMood()({
        hunger: 50,
        happiness: 50,
        energy: 50,
        cleanliness: 50,
        health: 50,
        discipline: 50,
      })
    ).toBe("neutral");

    expect(
      getMood()({
        hunger: 30,
        happiness: 30,
        energy: 30,
        cleanliness: 30,
        health: 30,
        discipline: 30,
      })
    ).toBe("sad");

    expect(
      getMood()({
        hunger: 10,
        happiness: 10,
        energy: 10,
        cleanliness: 10,
        health: 10,
        discipline: 10,
      })
    ).toBe("critical");
  });

  test("offline reconciliation hatches the egg exactly once when enough time passes", () => {
    const state = createInitialState()(18);
    const future = state.eggStartTime + state.hatchDurationMs + 1_000;

    const reconciled = simulateElapsedTime()(state, future);

    expect(reconciled.stage).toBe("hatchling");
    expect(reconciled.eggStartTime).toBeNull();
    expect(reconciled.hatchDurationMs).toBeNull();
    expect(reconciled.lastSimulatedAt).toBe(future);
  });

  test("skip incubation hatches an egg immediately for in-app testing", () => {
    const state = createInitialState()(18, 25_000);

    const hatched = skipIncubation()(state, 26_000);

    expect(hatched.stage).toBe("hatchling");
    expect(hatched.eggStartTime).toBeNull();
    expect(hatched.hatchDurationMs).toBeNull();
    expect(hatched.lastSimulatedAt).toBe(26_000);
    expect(hatched.stats.hunger).toBeGreaterThan(0);
  });

  test("manual evolve advances the current dino by exactly one stage per click", () => {
    const hatchling = {
      ...createInitialState()(18, 20_000),
      stage: "hatchling" as const,
      ageMs: 1_000,
      eggStartTime: null,
      hatchDurationMs: null,
      careQuality: 84,
      branchKey: null,
      sleeping: true,
      attention: true,
      attentionReason: "hunger" as const,
      lastSimulatedAt: 20_000,
    };

    const evolved = evolveCurrentDino()(hatchling, 21_000);

    expect(evolved.stage).toBe("juvenile");
    expect(evolved.branchKey).toBe("ideal");
    expect(evolved.attention).toBe(false);
    expect(evolved.attentionReason).toBeNull();
    expect(evolved.sleeping).toBe(false);
    expect(evolved.lastSimulatedAt).toBe(21_000);
  });

  test("manual evolve stops changing once the current dino is already adult", () => {
    const adult = {
      ...createInitialState()(18, 30_000),
      stage: "adult" as const,
      ageMs: 30 * HOUR_MS,
      eggStartTime: null,
      hatchDurationMs: null,
      branchKey: "steady" as const,
      lastSimulatedAt: 30_000,
    };

    const evolved = evolveCurrentDino()(adult, 31_000);

    expect(evolved).toEqual(adult);
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

  test("accumulates decay across minute-by-minute reconciliation ticks", () => {
    const base = createInitialState()(18, 1_000);
    const hatchTime = base.eggStartTime + base.hatchDurationMs + 1_000;
    let incremental = simulateElapsedTime()(base, hatchTime);

    for (let tick = incremental.lastSimulatedAt + 60_000; tick <= hatchTime + 8 * HOUR_MS; tick += 60_000) {
      incremental = simulateElapsedTime()(incremental, tick);
    }

    expect(incremental.poopCount).toBeGreaterThan(0);
    expect(incremental.careMistakes).toBeGreaterThan(0);
    expect(incremental.stats.hunger).toBeLessThan(72);
    expect(incremental.stats.cleanliness).toBeLessThan(82);
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

  test("low discipline generates a discipline attention state during reconciliation", () => {
    const unrulyState = {
      ...createInitialState()(12, 50_000),
      stage: "juvenile",
      attention: false,
      attentionReason: null,
      stats: {
        hunger: 84,
        happiness: 80,
        energy: 78,
        cleanliness: 82,
        health: 86,
        discipline: 18,
      },
      lastSimulatedAt: 50_000,
    };

    const reconciled = simulateElapsedTime()(unrulyState, 50_000);

    expect(reconciled.attention).toBe(true);
    expect(reconciled.attentionReason).toBe("discipline");
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

  test("offline reconciliation applies every crossed growth gate in one pass", () => {
    const base = createInitialState()(18);
    const hatched = simulateElapsedTime()(base, base.eggStartTime + base.hatchDurationMs + 1_000);
    const overAged = {
      ...hatched,
      stage: "hatchling",
      ageMs: 30 * 60 * 60 * 1_000,
      lastSimulatedAt: hatched.lastSimulatedAt,
    };

    const reconciled = simulateElapsedTime()(overAged, overAged.lastSimulatedAt + 60_000);

    expect(reconciled.stage).toBe("adult");
  });

  test("overnight reconciliation triggers sleep attention even after the sleep window ends", () => {
    const start = new Date(2026, 2, 30, 0, 30, 0, 0).getTime();
    const end = new Date(2026, 2, 30, 7, 30, 0, 0).getTime();
    const base = createInitialState()(18, start);
    const hatched = simulateElapsedTime()(base, base.eggStartTime + base.hatchDurationMs + 1_000);
    const awake = {
      ...hatched,
      stage: "hatchling",
      sleeping: false,
      poopCount: 0,
      attention: false,
      attentionReason: null,
      stats: {
        hunger: 95,
        happiness: 95,
        energy: 95,
        cleanliness: 95,
        health: 95,
        discipline: 95,
      },
      lastSimulatedAt: start,
    };

    const reconciled = simulateElapsedTime()(awake, end);

    expect(reconciled.attentionReason).toBe("sleep");
  });

  test("soft-failed runs stay terminal until the player resets", () => {
    const state = {
      ...createInitialState()(18, 100_000),
      stage: "juvenile",
      runStatus: "soft-failed",
      sick: true,
      stats: {
        hunger: 80,
        happiness: 80,
        energy: 80,
        cleanliness: 80,
        health: 5,
        discipline: 80,
      },
      lastSimulatedAt: 100_000,
    };

    const healed = applyPlayerAction()(state, "medicine", 101_000);

    expect(healed.runStatus).toBe("soft-failed");
    expect(healed.stats.health).toBeLessThanOrEqual(state.stats.health);
  });

  test("reports when an action was ignored by a collapsed run", () => {
    const state = {
      ...createInitialState()(18, 100_000),
      stage: "juvenile",
      runStatus: "soft-failed",
      sick: true,
      stats: {
        hunger: 80,
        happiness: 80,
        energy: 80,
        cleanliness: 80,
        health: 5,
        discipline: 80,
      },
      lastSimulatedAt: 100_000,
    };

    const ignored = applyPlayerAction()(state, "feed", 101_000);
    const statusCheck = applyPlayerAction()(state, "status", 102_000);

    expect(didActionApply()(ignored, "feed", 101_000)).toBe(false);
    expect(didActionApply()(statusCheck, "status", 102_000)).toBe(true);
  });

  test("records adult branch progression from reconciled state without a player action", () => {
    const meta = {
      version: 1,
      unlockedSpeciesIds: [18],
      discoveredBranches: [],
      bestCareQualityBySpecies: {},
    };
    const adultState = {
      ...createInitialState()(18, 10_000),
      stage: "adult",
      branchKey: "ideal",
      careQuality: 84,
      ageMs: 30 * HOUR_MS,
      lastSimulatedAt: 20_000,
      eggStartTime: null,
      hatchDurationMs: null,
    };

    const reconciledMeta = reconcileMetaProgression()(meta, adultState);

    expect(reconciledMeta.discoveredBranches).toEqual(["ideal"]);
    expect(reconciledMeta.bestCareQualityBySpecies[18]).toBe(84);
  });
});
