import { expect, test } from "@playwright/test";

test.describe("Tamagotchi overhaul", () => {
  test("supports the adoption flow", async ({ page }) => {
    await page.goto("/tamagotchi");

    const chooseButton = page.getByRole("button", { name: /choose your dino|adopt/i });
    await expect(chooseButton).toBeVisible();
    await chooseButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel(/search dinosaurs/i)).toBeVisible();

    const randomButton = page.getByRole("button", { name: /random dino/i });
    await expect(randomButton).toBeVisible();
  });

  test("exposes the core care controls and condition indicators", async ({ page }) => {
    await page.goto("/tamagotchi");

    const chooseButton = page.getByRole("button", { name: /choose your dino|adopt/i });
    await chooseButton.click();
    await page.getByRole("button", { name: /random dino/i }).click();

    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /clean/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /medicine/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /lights/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /discipline/i })).toBeVisible();
    await expect(page.getByText(/sleep:/i).first()).toBeVisible();
    await expect(page.getByText(/sick:/i).first()).toBeVisible();
    await expect(page.getByText(/mess:/i).first()).toBeVisible();
    await expect(page.getByText(/attention:/i).first()).toBeVisible();
  });

  test("preserves the active run across reloads", async ({ page }) => {
    await page.goto("/tamagotchi");

    const chooseButton = page.getByRole("button", { name: /choose your dino|adopt/i });
    await chooseButton.click();
    await page.getByRole("button", { name: /random dino/i }).click();

    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /choose your dino|adopt/i })).toHaveCount(0);

    await page.reload();

    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /choose your dino|adopt/i })).toHaveCount(0);
  });

  test("keeps the main shell visible on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tamagotchi");

    await expect(page.getByRole("heading", { name: /dino care|tamagotchi/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /choose your dino|adopt/i })).toBeVisible();

    const shell = page.locator("main#main-content");
    await expect(shell).toBeVisible();
  });
});
