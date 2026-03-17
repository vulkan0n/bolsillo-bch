import { test, expect } from "./helpers/fixtures";
import { nav, settingsPage } from "./helpers/selectors";

test.describe("Settings", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");
  });

  test("settings page renders", async ({ appPage: page }) => {
    const container = page.locator(settingsPage.container);
    await expect(container).toBeVisible();
  });

  test("has expected sections", async ({ appPage: page }) => {
    // Accordion buttons contain section titles
    await expect(page.locator("button", { hasText: "Wallets" })).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Security" })
    ).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Currency" })
    ).toBeVisible();
  });

  test("accordions expand and collapse", async ({ appPage: page }) => {
    // Click "Wallets" accordion button
    const walletsBtn = page.locator("button", { hasText: "Wallets" });
    await expect(walletsBtn).toBeVisible();
    await walletsBtn.click();

    // Content should appear (link text is "Create/Import Wallet")
    const content = page.getByText("Create/Import Wallet", { exact: false });
    await expect(content).toBeVisible({ timeout: 3_000 });

    // Click again to collapse
    await walletsBtn.click();
    await expect(content).toBeHidden();
  });

  test("network settings shows server selector", async ({
    appPage: page,
  }) => {
    const networkBtn = page.locator("button", { hasText: "Network" });
    await expect(networkBtn).toBeVisible();
    await networkBtn.click();

    // Should show a select element (server list)
    const serverSelect = page.locator("select");
    await expect(serverSelect.first()).toBeVisible({ timeout: 3_000 });
  });

  test("currency settings shows denomination", async ({
    appPage: page,
  }) => {
    const currencyBtn = page.locator("button", { hasText: "Currency" });
    await expect(currencyBtn).toBeVisible();
    await currencyBtn.click();

    await expect(
      page.getByText("Denomination", { exact: false })
    ).toBeVisible({ timeout: 3_000 });
  });

  test("privacy settings has hide balance toggle", async ({
    appPage: page,
  }) => {
    const privacyBtn = page.locator("button", { hasText: "Privacy" });
    await expect(privacyBtn).toBeVisible();
    await privacyBtn.click();

    await expect(
      page.getByText("Hide balances", { exact: false })
    ).toBeVisible({ timeout: 3_000 });
  });
});
