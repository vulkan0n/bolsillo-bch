import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";
import { accordionControl } from "./helpers/wallet";

test.describe("Settings: Payment", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const paymentBtn = page.locator("button", { hasText: "Payment" });
    await expect(paymentBtn).toBeVisible();
    await paymentBtn.click();
  });

  test("instant pay toggle shows limit input when enabled", async ({
    appPage: page,
  }) => {
    const checkbox = accordionControl(
      page,
      "Allow Instant Pay",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    // The instant pay limit input should be visible (always rendered)
    const limitLabel = page.getByText("Instant Pay limit", { exact: false });
    await expect(limitLabel).toBeVisible();

    const limitInput = page.locator('input[inputmode="decimal"]');
    await expect(limitInput.first()).toBeVisible();
  });

  test("legacy payment format toggle works", async ({ appPage: page }) => {
    const checkbox = accordionControl(
      page,
      "Legacy payment request format",
      "input[type='checkbox']"
    );
    await checkbox.scrollIntoViewIfNeeded();
    await expect(checkbox).toBeVisible({ timeout: 3_000 });

    const wasBefore = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!wasBefore);

    // Restore
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(wasBefore);
  });
});
