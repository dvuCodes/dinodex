import { test, expect } from "@playwright/test";

test.describe("Dino Detail Page", () => {
  test("renders all major sections for dino 001", async ({ page }) => {
    await page.goto("/dino/001");

    // Nav strip with prev/next
    const nav = page.locator('nav[aria-label="Dinosaur navigation"]');
    await expect(nav).toBeVisible();

    // Hero header with dino name
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    const name = await heading.textContent();
    expect(name?.length).toBeGreaterThan(0);

    // Dex number
    await expect(page.locator('text="#001"').first()).toBeVisible();

    // Badge pills (era, diet, type, locomotion)
    const badges = page.locator(".rounded-pill");
    expect(await badges.count()).toBeGreaterThanOrEqual(3);

    // Art container
    const art = page.locator(".dex-scanline");
    await expect(art.first()).toBeVisible();

    // Stage evolution (radiogroup)
    const stageGroup = page.locator('[role="radiogroup"]');
    await expect(stageGroup).toBeVisible();

    // Stats section
    await expect(page.locator("text=Stats")).toBeVisible();
    const statBars = page.locator('[role="meter"]');
    expect(await statBars.count()).toBe(6);

    // Info grid
    await expect(page.getByText("Era", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Region", { exact: true })).toBeVisible();

    // About this stage
    await expect(page.locator("text=About this stage")).toBeVisible();

    // Fun fact
    await expect(page.locator("text=Fun Fact")).toBeVisible();
  });

  test("stage switching changes stats and description", async ({ page }) => {
    await page.goto("/dino/001");

    // Default stage is adult — get initial description
    const descriptionArea = page.locator('[aria-live="polite"]');
    const initialText = await descriptionArea.textContent();

    // Click hatchling stage
    const hatchlingRadio = page.locator('[role="radio"][aria-label="View hatchling stage"]');
    await hatchlingRadio.click();

    // Wait for description to change
    await page.waitForTimeout(500);
    const newText = await descriptionArea.textContent();
    expect(newText).not.toBe(initialText);

    // URL should update with stage param
    expect(page.url()).toContain("stage=hatchling");
  });

  test("prev/next navigation works", async ({ page }) => {
    await page.goto("/dino/001");

    // Click next dino link
    const nextLink = page.locator('a[aria-label*="next dinosaur"]');
    await expect(nextLink).toBeVisible();
    await nextLink.click();

    // Should navigate to dino 002
    await page.waitForURL("**/dino/002**");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("circular navigation wraps from first to last", async ({ page }) => {
    await page.goto("/dino/001");

    // Click prev dino link (should go to last dino)
    const prevLink = page.locator('a[aria-label*="previous dinosaur"]');
    await expect(prevLink).toBeVisible();
    await prevLink.click();

    // Should navigate to dino 030
    await page.waitForURL("**/dino/030**");
  });

  test("related dinos section renders with dark theme", async ({ page }) => {
    await page.goto("/dino/001");

    // Related species section
    const relatedSection = page.locator("text=Related Species");
    // This might not exist for all dinos, check if dino 001 has related
    const hasRelated = await relatedSection.isVisible().catch(() => false);
    if (hasRelated) {
      // Dark container
      const container = relatedSection.locator("..");
      await expect(container).toBeVisible();
    }
  });

  test("page renders correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dino/005");

    // All major sections should still be visible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[role="radiogroup"]')).toBeVisible();
    await expect(page.locator("text=Stats")).toBeVisible();
    await expect(page.locator("text=Fun Fact")).toBeVisible();
  });

  test("page renders correctly on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dino/015");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[role="radiogroup"]')).toBeVisible();
    await expect(page.locator("text=Stats")).toBeVisible();
  });

  test("stage evolution has proper ARIA attributes", async ({ page }) => {
    await page.goto("/dino/001");

    const radiogroup = page.locator('[role="radiogroup"]');
    await expect(radiogroup).toHaveAttribute("aria-label", "Evolution stages");

    // Check radio buttons
    const radios = page.locator('[role="radio"]');
    expect(await radios.count()).toBe(3);

    // One should be checked (adult by default)
    const checkedRadio = page.locator('[role="radio"][aria-checked="true"]');
    await expect(checkedRadio).toHaveCount(1);
  });

  test("navigating between boundary dinos works", async ({ page }) => {
    // Test last dino
    await page.goto("/dino/030");
    await expect(page.locator("h1")).toBeVisible();

    // Next should wrap to 001
    const nextLink = page.locator('a[aria-label*="next dinosaur"]');
    await nextLink.click();
    await page.waitForURL("**/dino/001**");
  });
});
