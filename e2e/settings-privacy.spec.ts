import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";
import { accordionControl, expectToggle } from "./helpers/wallet";

test.describe("Settings: Privacy", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const privacyBtn = page.locator("button", { hasText: "Privacy" });
    await expect(privacyBtn).toBeVisible();
    await privacyBtn.click();
  });

  test("hide balance toggle works and affects wallet view", async ({
    appPage: page,
  }) => {
    const checkbox = accordionControl(
      page,
      "Hide balances",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    // Enable hide balance
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
    await expect(checkbox).toBeChecked();

    // Go to wallet — balance should be hidden
    await page.click(nav.wallet);
    const balanceArea = page.locator('[data-testid="balance-area"]');
    await expect(balanceArea).toHaveAttribute("data-hidden", "true", {
      timeout: 3_000,
    });

    // Disable hide balance
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");
    await page.locator("button", { hasText: "Privacy" }).click();
    const checkbox2 = accordionControl(
      page,
      "Hide balances",
      "input[type='checkbox']"
    );
    await checkbox2.click();
    await expect(checkbox2).not.toBeChecked();
  });

  test("daily check-in toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "Stats check-in",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    await expectToggle(checkbox);
  });

  test("auto-resolve token metadata toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "resolve Token metadata",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    await expectToggle(checkbox);
  });
});
