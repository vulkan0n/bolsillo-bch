import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";
import { accordionControl } from "./helpers/wallet";

test.describe("Settings: Localization", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const intlBtn = page.locator("button", { hasText: "Localization" });
    await expect(intlBtn).toBeVisible();
    await intlBtn.click();
  });

  test("language select shows available languages", async ({
    appPage: page,
  }) => {
    const langSelect = accordionControl(page, "Language", "select");
    await expect(langSelect).toBeVisible({ timeout: 3_000 });

    const count = await langSelect.locator("option").count();
    expect(count).toBeGreaterThan(5);
  });

  test("switching language updates UI text", async ({ appPage: page }) => {
    const langSelect = accordionControl(page, "Language", "select");
    await expect(langSelect).toBeVisible();

    // Switch to Spanish — label text changes so re-query by structure
    await langSelect.selectOption({ value: "es" });
    const select = page
      .locator('[data-testid="settings-view"] select')
      .first();
    await expect(select).toHaveValue("es");

    // The English accordion label "Wallets" should now show as "Billeteras"
    await expect(
      page.locator('[data-testid="settings-view"]')
    ).toContainText("Billeteras");

    // Restore to device default
    await select.selectOption({ value: "" });
    await expect(select).toHaveValue("");
  });
});
