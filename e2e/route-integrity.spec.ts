import { expect, test } from "@playwright/test";

test.describe("route integrity", () => {
  test("Dex nav and back link point to the canonical home route", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Dex", exact: true })).toHaveAttribute(
      "href",
      "/"
    );

    await page.goto("/dino/001");
    await expect(page.getByRole("link", { name: /Back to Dinodex/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  test("/dex redirects to the canonical home route", async ({ page }) => {
    await page.goto("/dex");

    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/Dinodex/i);
  });

  test("/dex keeps query-string filters when redirecting to home", async ({ page }) => {
    await page.goto("/dex?era=cretaceous&diet=carnivore&q=rex");

    await expect(page).toHaveURL(/\/\?era=cretaceous&diet=carnivore&q=rex$/);
  });
});
