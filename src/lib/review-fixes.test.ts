import { describe, expect, test } from "bun:test";
import {
  getArtPath,
  getArtRecoveryProbeSrc,
  getStageDexId,
  getPlaceholderArtPath,
  formatStageDexNumber,
  shouldAttemptArtRecovery,
} from "./utils";
import { createFilterQueryString, parseFilterState } from "./filter-state";
import { buildCanonicalDexHref } from "./routes";
import { getActionFeedbackKey, syncStateRef } from "./tamagotchi";

describe("getArtPath", () => {
  test("resolves generated WebP art for each stage and size", () => {
    expect(getArtPath(18, "adult")).toBe("/dinos/018/adult.webp");
    expect(getArtPath(18, "adult", "thumb")).toBe("/dinos/018/adult-thumb.webp");
    expect(getArtPath(18, "hatchling")).toBe("/dinos/018/hatchling.webp");
  });
});

describe("art recovery helpers", () => {
  test("only retries while a placeholder fallback is active", () => {
    const fallbackArtSrc = getPlaceholderArtPath("adult");

    expect(shouldAttemptArtRecovery(fallbackArtSrc, fallbackArtSrc)).toBe(true);
    expect(shouldAttemptArtRecovery("/dinos/018/adult.webp", fallbackArtSrc)).toBe(false);
  });

  test("adds a cache-busting query when probing recovered art", () => {
    expect(getArtRecoveryProbeSrc("/dinos/018/adult.webp", "123")).toBe(
      "/dinos/018/adult.webp?art-retry=123"
    );
    expect(getArtRecoveryProbeSrc("/dinos/018/adult.webp?size=full", "123")).toBe(
      "/dinos/018/adult.webp?size=full&art-retry=123"
    );
  });
});

describe("stage dex numbering", () => {
  test("assigns a unique dex number to each stage within a species", () => {
    expect(getStageDexId(1, "hatchling")).toBe(1);
    expect(getStageDexId(1, "juvenile")).toBe(2);
    expect(getStageDexId(1, "adult")).toBe(3);
    expect(getStageDexId(30, "adult")).toBe(90);
  });

  test("formats stage-specific dex labels using two digits", () => {
    expect(formatStageDexNumber(1, "hatchling")).toBe("#01");
    expect(formatStageDexNumber(1, "juvenile")).toBe("#02");
    expect(formatStageDexNumber(1, "adult")).toBe("#03");
    expect(formatStageDexNumber(30, "adult")).toBe("#90");
  });
});

describe("filter state helpers", () => {
  test("parses valid filter params from URLSearchParams", () => {
    const filters = parseFilterState(new URLSearchParams("era=cretaceous&diet=carnivore&q=rex"));

    expect(filters).toEqual({
      eraFilter: "cretaceous",
      dietFilter: "carnivore",
      searchQuery: "rex",
    });
  });

  test("normalizes invalid filter params to defaults", () => {
    const filters = parseFilterState(new URLSearchParams("era=permian&diet=scavenger"));

    expect(filters).toEqual({
      eraFilter: "all",
      dietFilter: "all",
      searchQuery: "",
    });
  });

  test("serializes only active filters into a query string", () => {
    expect(
      createFilterQueryString({
        eraFilter: "cretaceous",
        dietFilter: "carnivore",
        searchQuery: "rex",
      })
    ).toBe("era=cretaceous&diet=carnivore&q=rex");

    expect(
      createFilterQueryString({
        eraFilter: "all",
        dietFilter: "all",
        searchQuery: "",
      })
    ).toBe("");
  });
});

describe("canonical dex routing", () => {
  test("preserves active filters when redirecting /dex to the home route", () => {
    expect(buildCanonicalDexHref(new URLSearchParams("era=cretaceous&diet=carnivore&q=rex"))).toBe(
      "/?era=cretaceous&diet=carnivore&q=rex"
    );
    expect(buildCanonicalDexHref(new URLSearchParams(""))).toBe("/");
  });
});

describe("tamagotchi state sync helpers", () => {
  test("updates the ref before notifying React state setters", () => {
    const previousState = {
      dinoId: 1,
      stage: "egg",
      stats: { hunger: 50, happiness: 50, energy: 50 },
      careScore: 0,
      totalInteractions: 0,
      lastAction: null,
      lastActionTime: 100,
      eggStartTime: 100,
      hatchDurationMs: 1_000,
    } as const;
    const nextState = {
      ...previousState,
      dinoId: 2,
      lastActionTime: 200,
    };
    const ref = { current: previousState };
    let observedDuringSetState = previousState;

    syncStateRef(ref, nextState, () => {
      observedDuringSetState = ref.current;
    });

    expect(ref.current).toEqual(nextState);
    expect(observedDuringSetState).toEqual(nextState);
  });

  test("creates a fresh action-feedback key for repeated identical actions", () => {
    expect(getActionFeedbackKey("feed", 100)).toBe("feed-100");
    expect(getActionFeedbackKey("feed", 101)).toBe("feed-101");
  });
});
