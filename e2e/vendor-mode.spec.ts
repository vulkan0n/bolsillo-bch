import { test, expect } from "./helpers/fixtures";

test.describe("Vendor Mode", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.goto("/vendor");
    // Wait for QR canvas to render (proves vendor mode is ready)
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 5_000 });
  });

  test("vendor mode page renders with QR and numpad", async ({
    appPage: page,
  }) => {
    const qrCanvas = page.locator("canvas").first();
    await expect(qrCanvas).toBeVisible();

    // Numpad grid buttons (digits 0-9, C for clear, . for decimal)
    const buttons = ["1", "5", "9", "0", "C", "."];
    await Promise.all(
      buttons.map((digit) =>
        expect(
          page
            .locator("button", {
              hasText: new RegExp(`^${digit === "." ? "\\." : digit}$`),
            })
            .first()
        ).toBeVisible()
      )
    );
  });

  test("numpad enters digits and updates display", async ({
    appPage: page,
  }) => {
    const amountDisplay = page.locator('[data-testid="vendor-amount"]');

    // Type "42" via numpad buttons
    await page.locator("button", { hasText: /^4$/ }).first().click();
    await page.locator("button", { hasText: /^2$/ }).first().click();

    // The amount display should reflect the entered value
    await expect(amountDisplay).toContainText("42");
  });

  test("clear button resets amount", async ({ appPage: page }) => {
    const amountDisplay = page.locator('[data-testid="vendor-amount"]');

    // Enter some digits — "78" chosen to avoid matching numpad button labels
    await page.locator("button", { hasText: /^7$/ }).first().click();
    await page.locator("button", { hasText: /^8$/ }).first().click();
    await expect(amountDisplay).toContainText("78");

    // Click "C" to clear
    await page.locator("button", { hasText: /^C$/ }).click();

    // The display should reset to zero
    await expect(amountDisplay).not.toContainText("78");
  });

  test("exit hint text is visible", async ({ appPage: page }) => {
    const exitHint = page.getByText("Long press", { exact: false });
    await expect(exitHint).toBeVisible({ timeout: 3_000 });
  });
});
