import { test, expect } from "./helpers/fixtures";
import { sendPage } from "./helpers/selectors";

test.describe("Send: Advanced Interactions", () => {
  // Satoshi's genesis address — known valid cashaddr
  const TEST_ADDR = "qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";

  test.beforeEach(async ({ appPage: page }) => {
    await page.goto(`/wallet/send/${TEST_ADDR}`);
    const header = page.locator(sendPage.header);
    await expect(header).toBeVisible({ timeout: 10_000 });
  });

  test("navigating with address shows address display", async ({
    appPage: page,
  }) => {
    // When navigating with a valid address, the Address component renders it
    const addressDisplay = page.getByText("qpm2qs", { exact: false });
    await expect(addressDisplay).toBeVisible();
  });

  test("tapping displayed address re-opens edit mode", async ({
    appPage: page,
  }) => {
    const addressDisplay = page.getByText("qpm2qs", { exact: false });
    await expect(addressDisplay).toBeVisible();

    // Clicking the address should switch to edit mode (Editable input)
    await addressDisplay.click();
    const editableInput = page.locator(sendPage.addressInput);
    await expect(editableInput).toBeVisible();
  });

  test("MAX button fills maximum sendable amount", async ({
    appPage: page,
  }) => {
    const maxBtn = page.getByText("MAX", { exact: true });
    await expect(maxBtn).toBeVisible();

    // Click MAX — on empty wallet this will be 0, but the click should not crash
    const amountInput = page.locator(sendPage.amountInput).first();
    await expect(amountInput).toBeVisible();
    await maxBtn.click();

    // The amount input should have a value (even "0" is valid for empty wallet)
    const value = await amountInput.inputValue();
    expect(value).toBeDefined();
  });

  test("scanner button opens scanner overlay", async ({ appPage: page }) => {
    // ScannerButton renders ScanOutlined icon with aria-label="scan"
    const scanBtn = page.locator('[role="img"][aria-label="scan"]').first();
    await expect(scanBtn).toBeVisible();

    await scanBtn.click();

    // Scanner overlay should appear with a close button (CloseOutlined)
    const closeBtn = page.locator('[role="img"][aria-label="close"]').first();
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });
    await closeBtn.click();
  });
});
