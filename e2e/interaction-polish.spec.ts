import { expect, test, type Locator, type Page } from "@playwright/test";
import { createInitialState, META_STORAGE_KEY, STORAGE_KEY, type TamagotchiMetaProgression } from "@/lib/tamagotchi";

async function tabTo(page: Page, target: Locator, maxTabs = 20) {
  for (let index = 0; index < maxTabs; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }

    await page.keyboard.press("Tab");
  }

  throw new Error("Timed out while tabbing to the target element");
}

async function expectVisibleFocusAffordance(locator: Locator) {
  const focusStyles = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  const outlineWidth = Number.parseFloat(focusStyles.outlineWidth);
  const hasOutline = focusStyles.outlineStyle !== "none" && outlineWidth > 0;
  const hasBoxShadow = focusStyles.boxShadow !== "none" && focusStyles.boxShadow !== "rgba(0, 0, 0, 0) 0px 0px 0px 0px";

  expect(hasOutline || hasBoxShadow).toBe(true);
}

async function getVisualStyles(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      transform: style.transform,
    };
  });
}

test.describe("Interaction polish", () => {
  test("homepage controls are interactive by mouse and keyboard", async ({ page }) => {
    const actionableWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "warning") {
        return;
      }

      const text = message.text();
      if (
        text.includes("data-scroll-behavior") ||
        text.includes("Largest Contentful Paint")
      ) {
        actionableWarnings.push(text);
      }
    });

    await page.goto("/");

    const navLink = page.getByRole("link", { name: "Dino Care", exact: true });
    await tabTo(page, navLink);
    await expect(navLink).toBeFocused();
    await expectVisibleFocusAffordance(navLink);

    const searchInput = page.getByRole("textbox", { name: /search dinosaurs/i });
    await searchInput.fill("rex");
    await expect(searchInput).toHaveValue("rex");

    const clearButton = page.getByRole("button", { name: /clear search/i });
    await clearButton.click();
    await expect(searchInput).toHaveValue("");

    const jurassicChip = page.getByRole("button", { name: /filter by jurassic/i });
    const chipBeforeHover = await getVisualStyles(jurassicChip);
    await jurassicChip.hover();
    await page.waitForTimeout(150);
    const chipAfterHover = await getVisualStyles(jurassicChip);
    expect(chipAfterHover.backgroundColor).not.toBe(chipBeforeHover.backgroundColor);
    expect(chipAfterHover.color).not.toBe(chipBeforeHover.color);
    expect(chipAfterHover.transform).toBe("none");
    await jurassicChip.click();
    await expect(jurassicChip).toHaveAttribute("aria-pressed", "true");

    const herbivoreChip = page.getByRole("button", { name: /filter by .* herbivore/i });
    await herbivoreChip.click();
    await expect(herbivoreChip).toHaveAttribute("aria-pressed", "true");

    await expect(page).toHaveURL(/era=jurassic/);
    await expect(page).toHaveURL(/diet=herbivore/);
    await expect(page.getByText(/species found/i)).toBeVisible();

    const firstCard = page.locator('a[href^="/dino/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.press("Enter");

    await expect(page).toHaveURL(/\/dino\/\d{3}/);
    expect(actionableWarnings).toEqual([]);
  });

  test("tamagotchi selector traps focus and enabled actions show visible feedback", async ({ page }) => {
    const seededRun = {
      ...createInitialState(1, Date.now() - 10 * 60 * 60 * 1000),
      stage: "hatchling" as const,
      ageMs: 0,
      eggStartTime: null,
      hatchDurationMs: null,
      branchKey: null,
      stats: {
        hunger: 62,
        happiness: 58,
        energy: 64,
        cleanliness: 70,
        health: 82,
        discipline: 55,
      },
      lastSimulatedAt: Date.now(),
      lastActionTime: Date.now() - 60_000,
      careQuality: 68,
      runStatus: "active" as const,
    };
    const seededMeta: TamagotchiMetaProgression = {
      version: 1,
      unlockedSpeciesIds: [1],
      discoveredBranches: ["steady"],
      bestCareQualityBySpecies: { 1: 68 },
    };

    await page.addInitScript(
      ([storageKey, metaStorageKey, state, meta]) => {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
        window.localStorage.setItem(metaStorageKey, JSON.stringify(meta));
      },
      [STORAGE_KEY, META_STORAGE_KEY, seededRun, seededMeta] as const
    );

    await page.goto("/tamagotchi");

    const selectorTrigger = page.getByRole("button", { name: /hatchery|choose your dino|browse hatchery/i }).first();
    await tabTo(page, selectorTrigger);
    await expect(selectorTrigger).toBeFocused();
    await expectVisibleFocusAffordance(selectorTrigger);

    await selectorTrigger.press("Enter");

    const dialog = page.getByRole("dialog", { name: /choose your dino/i });
    const search = page.getByRole("searchbox", { name: /search dinosaurs/i });
    await expect(dialog).toBeVisible();
    await expect(search).toBeFocused();

    const closeButton = page.getByRole("button", { name: /close dinosaur selector/i });
    await page.keyboard.press("Shift+Tab");
    await expect(closeButton).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(search).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(selectorTrigger).toBeFocused();

    const feedButton = page.getByRole("button", { name: /^feed$/i });
    await expect(feedButton).toBeEnabled();

    await feedButton.click();
    await expect(page.getByText(/meal served/i)).toBeVisible();
  });
});
