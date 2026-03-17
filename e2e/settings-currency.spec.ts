import { test, expect } from "./helpers/fixtures";
import { nav, walletView } from "./helpers/selectors";
import { accordionControl } from "./helpers/wallet";

test.describe("Settings: Currency", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const currencyBtn = page.locator("button", { hasText: "Currency" });
    await expect(currencyBtn).toBeVisible();
    await currencyBtn.click();
  });

  test("denomination select changes between BCH and sats", async ({
    appPage: page,
  }) => {
    const denomSelect = accordionControl(page, "Denomination", "select");
    await expect(denomSelect).toBeVisible({ timeout: 3_000 });

    // Verify options include BCH and sats
    const options = denomSelect.locator("option");
    const optionTexts = await options.allTextContents();
    expect(optionTexts.some((t) => /bch/i.test(t))).toBe(true);
    expect(optionTexts.some((t) => /sat/i.test(t))).toBe(true);

    // Switch to sats
    const satsLabel = optionTexts.find((t) => /sat/i.test(t))!;
    await denomSelect.selectOption({ label: satsLabel });

    // Verify balance area is still functional
    await page.click(nav.wallet);
    const balanceArea = page.locator(walletView.balanceArea);
    await expect(balanceArea).toBeVisible();

    // Restore to BCH
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");
    await page.locator("button", { hasText: "Currency" }).click();
    const denomSelect2 = accordionControl(page, "Denomination", "select");
    const bchLabel = optionTexts.find((t) => /bch/i.test(t))!;
    await denomSelect2.selectOption({ label: bchLabel });
  });

  test("local currency select changes fiat currency", async ({
    appPage: page,
  }) => {
    const currencySelect = accordionControl(page, "Local currency", "select").first();
    await expect(currencySelect).toBeVisible({ timeout: 3_000 });

    // Should have many currencies
    const count = await currencySelect.locator("option").count();
    expect(count).toBeGreaterThan(10);

    // Select EUR
    await currencySelect.selectOption({ value: "EUR" });
    await expect(currencySelect).toHaveValue("EUR");

    // Restore USD
    await currencySelect.selectOption({ value: "USD" });
  });

  test("prefer local currency toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "Prefer local currency",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    const wasChecked = await checkbox.isChecked();
    await checkbox.click();
    if (wasChecked) {
      await expect(checkbox).not.toBeChecked();
    } else {
      await expect(checkbox).toBeChecked();
    }

    // Restore
    await checkbox.click();
    if (wasChecked) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  });
});
