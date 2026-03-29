import { beforeEach, describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import dinos from "@/data/dinos.json";
import { META_STORAGE_KEY, STORAGE_KEY, createInitialState, type TamagotchiMetaProgression } from "@/lib/tamagotchi";
import { TamagotchiGame } from "./TamagotchiGame";

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

function seedPersistedRun() {
  const now = 1_750_000_000_000;
  const state = {
    ...createInitialState(1, now - 10 * 60 * 60 * 1000),
    stage: "adult" as const,
    ageMs: 30 * 60 * 60 * 1000,
    eggStartTime: null,
    hatchDurationMs: null,
    branchKey: "ideal" as const,
    stats: {
      hunger: 88,
      happiness: 84,
      energy: 76,
      cleanliness: 90,
      health: 92,
      discipline: 78,
    },
    lastSimulatedAt: now,
    lastAction: "play" as const,
    lastActionTime: now - 60_000,
    careQuality: 84,
    runStatus: "active" as const,
  };
  const meta: TamagotchiMetaProgression = {
    version: 2,
    unlockedSpeciesIds: [1],
    discoveredBranches: ["ideal"],
    bestCareQualityBySpecies: { 1: 84 },
  };

  memoryStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  memoryStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
}

function withLocalStorage<T>(enabled: boolean, run: () => T): T {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  if (enabled) {
    Object.defineProperty(globalThis, "localStorage", {
      value: memoryStorage,
      configurable: true,
    });
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }

  try {
    return run();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, "localStorage", descriptor);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  }
}

describe("TamagotchiGame hydration", () => {
  beforeEach(() => {
    memoryStorage.clear();
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  test("matches the empty adoption shell on the first client render before effects run", () => {
    seedPersistedRun();

    const serverMarkup = withLocalStorage(false, () => renderToString(<TamagotchiGame dinos={[dinos[0]]} />));
    const firstClientMarkup = withLocalStorage(true, () => renderToString(<TamagotchiGame dinos={[dinos[0]]} />));

    expect(serverMarkup).toContain("Adopt a dinosaur egg");
    expect(firstClientMarkup).toContain("Adopt a dinosaur egg");
  });
});
