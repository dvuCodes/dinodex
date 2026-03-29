import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "dinodex-tamagotchi";
const META_STORAGE_KEY = "dinodex-tamagotchi-meta";

function buildEggState(now: number) {
  return {
    version: 1,
    speciesId: 1,
    dinoId: 1,
    stage: "egg",
    stats: {
      hunger: 72,
      happiness: 76,
      energy: 70,
      cleanliness: 82,
      health: 86,
      discipline: 58,
    },
    ageMs: 0,
    lastSimulatedAt: now,
    lastAction: null,
    lastActionTime: now,
    sleeping: false,
    attention: false,
    attentionReason: null,
    sick: false,
    poopCount: 0,
    careMistakes: 0,
    careQuality: 70,
    branchKey: null,
    runStatus: "active",
    eggStartTime: now,
    hatchDurationMs: 60 * 60 * 1000,
  };
}

function buildAdultState(now: number) {
  return {
    version: 1,
    speciesId: 1,
    dinoId: 1,
    stage: "adult",
    stats: {
      hunger: 88,
      happiness: 84,
      energy: 76,
      cleanliness: 90,
      health: 92,
      discipline: 78,
    },
    ageMs: 30 * 60 * 60 * 1000,
    lastSimulatedAt: now,
    lastAction: "play",
    lastActionTime: now,
    sleeping: false,
    attention: false,
    attentionReason: null,
    sick: false,
    poopCount: 0,
    careMistakes: 0,
    careQuality: 84,
    branchKey: "ideal",
    runStatus: "active",
    eggStartTime: null,
    hatchDurationMs: null,
  };
}

async function seedState(page: Page, state: Record<string, unknown>) {
  await page.addInitScript(
    ({ storageKey, metaStorageKey, state: nextState }) => {
      localStorage.setItem(storageKey, JSON.stringify(nextState));
      localStorage.setItem(
        metaStorageKey,
        JSON.stringify({
          version: 1,
          unlockedSpeciesIds: [1],
          discoveredBranches: ["ideal"],
          bestCareQualityBySpecies: { 1: 84 },
        })
      );
    },
    { storageKey: STORAGE_KEY, metaStorageKey: META_STORAGE_KEY, state }
  );
}

async function openTamagotchi(page: Page) {
  const title = page.getByRole("heading", { name: "Dino Care" });

  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.goto("/tamagotchi");

    try {
      await expect(title).toBeVisible({ timeout: 4_000 });
      return;
    } catch {
      if (attempt === 5) {
        throw new Error("Tamagotchi route did not finish compiling");
      }

      await page.waitForTimeout(1_000);
    }
  }
}

test.describe("Tamagotchi overhaul", () => {
  test("supports the adoption flow", async ({ page }) => {
    test.slow();
    await openTamagotchi(page);

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
    await openTamagotchi(page);

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
    await openTamagotchi(page);

    const chooseButton = page.getByRole("button", { name: /choose your dino|adopt/i });
    await chooseButton.click();
    await page.getByRole("button", { name: /random dino/i }).click({ force: true });

    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /choose your dino|adopt/i })).toHaveCount(0);

    await page.reload();

    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /choose your dino|adopt/i })).toHaveCount(0);
  });

  test("renders the incubating egg shell from persisted state", async ({ page }) => {
    await seedState(page, buildEggState(Date.now()));
    await openTamagotchi(page);

    await expect(page.getByText(/incubating/i).first()).toBeVisible();
    await expect(page.getByText(/locked until hatch/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /feed/i })).toBeDisabled();
  });

  test("renders the persisted sprite shell for active runs", async ({ page }) => {
    await seedState(page, buildAdultState(Date.now()));
    await openTamagotchi(page);

    const sprite = page.getByTestId("tamagotchi-pixel-screen");
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute("aria-label", /pixel sprite in tamagotchi mode/i);
  });

  test("keeps the pixel shell visible when art requests are blocked", async ({ page }) => {
    await seedState(page, buildAdultState(Date.now()));
    await page.route("**/dinos/**", async (route) => {
      await route.abort();
    });

    await openTamagotchi(page);

    const sprite = page.getByTestId("tamagotchi-pixel-screen");
    await expect(sprite).toBeVisible();
    await expect(sprite).toHaveAttribute("aria-label", /pixel sprite in tamagotchi mode/i);
    await expect(page.getByRole("button", { name: /feed/i })).toBeVisible();
  });

  test("keeps the pocket shell stacked on mobile and split on desktop", async ({ page }) => {
    await seedState(page, buildAdultState(Date.now()));
    await page.setViewportSize({ width: 390, height: 844 });
    await openTamagotchi(page);

    const avatarHeading = page.getByRole("heading", { name: /eoraptor #001/i });
    const controlsHeading = page.getByRole("heading", { name: /vitals and controls/i });

    const mobileAvatarBox = await avatarHeading.boundingBox();
    const mobileControlsBox = await controlsHeading.boundingBox();

    expect(mobileAvatarBox).not.toBeNull();
    expect(mobileControlsBox).not.toBeNull();
    expect(mobileControlsBox!.y).toBeGreaterThan(mobileAvatarBox!.y);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();

    const desktopAvatarBox = await avatarHeading.boundingBox();
    const desktopControlsBox = await controlsHeading.boundingBox();

    expect(desktopAvatarBox).not.toBeNull();
    expect(desktopControlsBox).not.toBeNull();
    expect(desktopControlsBox!.x).toBeGreaterThan(desktopAvatarBox!.x);

    const shell = page.locator("main#main-content");
    await expect(shell).toBeVisible();
  });
});
