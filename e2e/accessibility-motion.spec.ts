import { expect, test } from "@playwright/test";

test.describe("Accessibility and motion hardening", () => {
  test("homepage exposes a skip link and a stable main landmark", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await page.keyboard.press("Tab");

    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("tamagotchi selector behaves like an accessible dialog", async ({ page }) => {
    await page.goto("/tamagotchi");

    const trigger = page.getByRole("button", { name: /choose your dino/i });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: /choose your dino/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel(/search dinosaurs/i)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("reduced motion disables looping header animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const pulseDot = page.locator("header .animate-pulse").first();
    await expect(pulseDot).toBeVisible();

    const animationName = await pulseDot.evaluate((element) => getComputedStyle(element).animationName);
    expect(animationName).toBe("none");
  });
});
