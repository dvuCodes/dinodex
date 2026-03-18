import { describe, expect, test } from "bun:test";
import {
  formatDefaultDexNumber,
  formatStageDexNumber,
  getDinoPageTitle,
  parseStageParam,
  getStageDexId,
} from "./utils";

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

  test("uses the adult stage dex number for species-level cards", () => {
    expect(formatDefaultDexNumber(1)).toBe("#001");
    expect(formatDefaultDexNumber(2)).toBe("#002");
    expect(formatDefaultDexNumber(30)).toBe("#030");
  });

  test("builds stage-aware page titles", () => {
    expect(getDinoPageTitle("Eoraptor", 1)).toBe("Eoraptor | Dinodex #03");
    expect(getDinoPageTitle("Eoraptor", 1, "juvenile")).toBe("Eoraptor | Dinodex #02");
    expect(getDinoPageTitle("Eoraptor", 1, "hatchling")).toBe("Eoraptor | Dinodex #01");
  });

  test("normalizes invalid stage params to adult", () => {
    expect(parseStageParam("hatchling")).toBe("hatchling");
    expect(parseStageParam("juvenile")).toBe("juvenile");
    expect(parseStageParam("adult")).toBe("adult");
    expect(parseStageParam("egg")).toBe("adult");
    expect(parseStageParam(undefined)).toBe("adult");
  });
});
