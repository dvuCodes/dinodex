import { describe, expect, test } from "bun:test";
import { isTamagotchiDebugEnabled } from "./tamagotchi-debug";

describe("tamagotchi debug helpers", () => {
  test("enables debug controls outside production", () => {
    expect(isTamagotchiDebugEnabled("development")).toBe(true);
    expect(isTamagotchiDebugEnabled("test")).toBe(true);
    expect(isTamagotchiDebugEnabled(undefined)).toBe(true);
  });

  test("disables debug controls in production", () => {
    expect(isTamagotchiDebugEnabled("production")).toBe(false);
  });
});
