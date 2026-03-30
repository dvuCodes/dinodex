const { chromium } = require("@playwright/test");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");

(async () => {
  const url = "http://127.0.0.1:3000/tamagotchi";
  const outDir = join(process.cwd(), "output", "playwright");
  const STORAGE_KEY = "dinodex-tamagotchi";
  const META_KEY = "dinodex-tamagotchi-meta";
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  const page = await context.newPage();

  async function ensureRunStarted() {
    await page.goto(url, { waitUntil: "load" });
    await page.waitForTimeout(800);
    if (await page.locator("#debug-dino-switcher").isVisible().catch(() => false)) {
      return;
    }
    await page.evaluate(({ storageKey, metaKey }) => {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(metaKey);
    }, { storageKey: STORAGE_KEY, metaKey: META_KEY });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(800);
    if (!(await page.locator("#debug-dino-switcher").isVisible().catch(() => false))) {
      await page.getByRole("button", { name: "Choose Your Dino" }).click();
      await page.getByRole("button", { name: /#001 Eoraptor/i }).click();
      await page.locator("#debug-dino-switcher").waitFor({ timeout: 10000 });
    }
  }

  async function setSpecies(speciesId) {
    await ensureRunStarted();
    await page.selectOption("#debug-dino-switcher", String(speciesId));
    await page.getByRole("button", { name: "Switch Dino" }).click();
    const skipButton = page.getByRole("button", { name: /Skip incubation/i });
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
    }
    await page.getByRole("button", { name: "Evolve Dino" }).click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Evolve Dino" }).click();
    await page.waitForTimeout(150);
  }

  async function patchState(mutatorSource) {
    await page.evaluate(({ key, mutatorSource }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) throw new Error("Missing tamagotchi state");
      const state = JSON.parse(raw);
      const mutator = eval(`(${mutatorSource})`);
      mutator(state);
      window.localStorage.setItem(key, JSON.stringify(state));
    }, { key: STORAGE_KEY, mutatorSource });
    await page.reload({ waitUntil: "load" });
    await page.locator('[data-testid="tamagotchi-pixel-sprite"]').waitFor({ timeout: 10000 });
    await page.waitForTimeout(300);
  }

  async function sample(label) {
    const sprite = page.locator('[data-testid="tamagotchi-pixel-sprite"]');
    await sprite.waitFor({ timeout: 10000 });
    const backgroundImage = await sprite.evaluate((el) => getComputedStyle(el).backgroundImage);
    const transformStart = await sprite.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(260);
    const transformNext = await sprite.evaluate((el) => getComputedStyle(el).transform);
    await page.screenshot({ path: join(outDir, `${label}.png`), fullPage: true });
    return { backgroundImage, transformStart, transformNext };
  }

  await setSpecies(6);
  await patchState(`function (state) {
    state.stage = "adult";
    state.sleeping = false;
    state.sick = false;
    state.attention = false;
    state.attentionReason = null;
    state.lastAction = "play";
    state.lastActionTime = Date.now();
    state.stats.hunger = 100;
    state.stats.happiness = 100;
    state.stats.energy = 100;
    state.stats.cleanliness = 100;
    state.stats.health = 100;
  }`);
  const happy = await sample("jurassic-006-happy");

  await setSpecies(8);
  await patchState(`function (state) {
    state.stage = "adult";
    state.sleeping = false;
    state.sick = true;
    state.attention = true;
    state.attentionReason = "health";
    state.lastAction = "status";
    state.lastActionTime = Date.now() - 600000;
    state.stats.hunger = 35;
    state.stats.happiness = 28;
    state.stats.energy = 40;
    state.stats.cleanliness = 22;
    state.stats.health = 18;
  }`);
  const sick = await sample("jurassic-008-sick");

  console.log(JSON.stringify({ happy, sick }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
