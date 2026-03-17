import { test, expect } from "./helpers/fixtures";
import { walletView } from "./helpers/selectors";

test.describe("Wallet View: Advanced Interactions", () => {
  test("QR button is rendered and clickable", async ({ appPage: page }) => {
    const qrBtn = page.locator(walletView.qrButton);
    await expect(qrBtn).toBeVisible();
    // Verify the QR button contains a canvas (the QR code image)
    const canvas = qrBtn.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("tapping balance with privacy mode active disables privacy mode", async ({
    appPage: page,
  }) => {
    // Enable privacy mode via the eye button
    const hideBtn = page.locator(walletView.balanceHideButton).first();
    await expect(hideBtn).toBeVisible();
    await hideBtn.click();

    // Balance should be marked as hidden
    const balanceArea = page.locator(walletView.balanceArea);
    await expect(balanceArea).toHaveAttribute("data-hidden", "true");

    // Tap the balance area — should disable privacy mode
    await balanceArea.click();
    await expect(balanceArea).toHaveAttribute("data-hidden", "false");
  });

  test("sync indicator is visible", async ({ appPage: page }) => {
    const syncIndicator = page.locator('[data-testid="sync-indicator"]');
    await expect(syncIndicator).toBeVisible({ timeout: 5_000 });
  });
});
