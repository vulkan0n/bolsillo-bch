import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";
import { accordionControl } from "./helpers/wallet";

test.describe("Settings: User Interface", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const uiBtn = page.locator("button", { hasText: "User Interface" });
    await expect(uiBtn).toBeVisible();
    await uiBtn.click();
  });

  test("theme mode cycles system/light/dark", async ({ appPage: page }) => {
    const themeSelect = accordionControl(page, "Theme mode", "select");
    await expect(themeSelect).toBeVisible({ timeout: 3_000 });

    const options = themeSelect.locator("option");
    expect(await options.count()).toBe(3);

    // Switch to dark
    await themeSelect.selectOption({ index: 2 });
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 2_000 });

    // Switch to light
    await themeSelect.selectOption({ index: 1 });
    await expect(page.locator("html")).not.toHaveClass(/dark/, { timeout: 2_000 });

    // Restore to system
    await themeSelect.selectOption({ index: 0 });
  });

  test("display exchange rate toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "exchange rate",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    const wasBefore = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!wasBefore);

    // Restore
    await checkbox.click();
  });

  test("display sync counter toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "sync counter",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    const wasBefore = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!wasBefore);

    // Restore
    await checkbox.click();
  });
});
