import { describe, expect, test } from "bun:test";
import { formatStageDexNumber, getStageDexId } from "./utils";

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
