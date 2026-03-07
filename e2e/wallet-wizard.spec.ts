import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";

test.describe("Wallet Wizard", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    // Expand Wallets accordion
    const walletsBtn = page.locator("button", { hasText: "Wallets" });
    await expect(walletsBtn).toBeVisible();
    await walletsBtn.click();

    // Click New Wallet
    const newWalletBtn = page.getByText("Create/Import Wallet", {
      exact: false,
    });
    await expect(newWalletBtn).toBeVisible({ timeout: 3_000 });
    await newWalletBtn.click();
    await page.waitForURL("**/settings/wallet/wizard**");
  });

  test("wizard page renders", async ({ appPage: page }) => {
    // Should show the Create and Import buttons
    await expect(
      page.getByRole("button", { name: /Create New Wallet/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Import Wallet/i })
    ).toBeVisible();
  });

  test("import option navigates to import form", async ({
    appPage: page,
  }) => {
    const importBtn = page.getByRole("button", { name: /Import Wallet/i });
    await expect(importBtn).toBeVisible();
    await importBtn.click();
    await page.waitForURL("**/settings/wallet/wizard/import**");

    // Import form should have a textarea for mnemonic
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
  });

  test("import validates word count", async ({ appPage: page }) => {
    const importBtn = page.getByRole("button", { name: /Import Wallet/i });
    await importBtn.click();
    await page.waitForURL("**/settings/wallet/wizard/import**");

    // Type 5 random words
    const textarea = page.locator("textarea");
    await textarea.fill("apple banana cherry dog elephant");

    // Submit
    const submitBtn = page.getByRole("button", { name: /Import Wallet/i });
    await submitBtn.click();

    // Should show validation error about word count
    await expect(
      page.getByText("exactly 12", { exact: false })
    ).toBeVisible({ timeout: 3_000 });
  });

  test("import validates BIP39 mnemonic", async ({ appPage: page }) => {
    const importBtn = page.getByRole("button", { name: /Import Wallet/i });
    await importBtn.click();
    await page.waitForURL("**/settings/wallet/wizard/import**");

    // Type 12 non-BIP39 words
    const textarea = page.locator("textarea");
    await textarea.fill(
      "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima"
    );

    // Submit
    const submitBtn = page.getByRole("button", { name: /Import Wallet/i });
    await submitBtn.click();

    // Should show invalid mnemonic error
    await expect(
      page.getByText("invalid", { exact: false }).or(
        page.getByText("Invalid", { exact: false })
      )
    ).toBeVisible({ timeout: 3_000 });
  });
});
