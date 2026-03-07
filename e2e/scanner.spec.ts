import { test, expect } from "./helpers/fixtures";
import { walletView, scanner } from "./helpers/selectors";

test.describe("Scanner", () => {
  test("scanner opens and closes", async ({ appPage: page }) => {
    const scannerBtn = page.locator(walletView.scannerButton);
    await expect(scannerBtn).toBeVisible();
    await scannerBtn.click();

    // Scanner overlay should appear (close button becomes visible)
    const closeBtn = page.locator(scanner.closeButton).first();
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });

    // Close scanner
    await closeBtn.click();

    // Should return to wallet view
    await expect(
      page.getByText("Receive", { exact: true }).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test.skip("scanner torch works", async ({ appPage: page }) => {
    // Scanner torch requires native Capacitor plugin - skip in headless
  });

  test.skip("image select scan works", async ({ appPage: page }) => {
    // Image select requires file picker / native camera - skip in headless
  });
});
