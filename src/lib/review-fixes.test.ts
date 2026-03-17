import { describe, expect, test } from "bun:test";
import {
  getArtPath,
  getArtRecoveryProbeSrc,
  getPlaceholderArtPath,
  shouldAttemptArtRecovery,
} from "./utils";
import { createFilterQueryString, parseFilterState } from "./filter-state";

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
