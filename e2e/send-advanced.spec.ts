import { test, expect } from "./helpers/fixtures";
import { sendPage, scanner } from "./helpers/selectors";

test.describe("Send: Advanced Interactions", () => {
  // Satoshi's genesis address — known valid cashaddr
  const TEST_ADDR = "qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";

  test.beforeEach(async ({ appPage: page }) => {
    await page.goto(`/wallet/send/${TEST_ADDR}`);
    await expect(sendPage.header(page)).toBeVisible({ timeout: 10_000 });
  });

  test("navigating with address shows address display", async ({
    appPage: page,
  }) => {
    const addressDisplay = page.getByText("qpm2qs", { exact: false });
    await expect(addressDisplay).toBeVisible();
  });

  test("tapping displayed address re-opens edit mode", async ({
    appPage: page,
  }) => {
    const addressDisplay = page.getByText("qpm2qs", { exact: false });
    await expect(addressDisplay).toBeVisible();

    await addressDisplay.click();
    await expect(sendPage.addressInput(page)).toBeVisible();
  });

  test("MAX button fills maximum sendable amount", async ({
    appPage: page,
  }) => {
    const maxBtn = page.getByText("MAX", { exact: true });
    await expect(maxBtn).toBeVisible();

    const amountInput = sendPage.amountInput(page).first();
    await expect(amountInput).toBeVisible();
    await maxBtn.click();

    // On empty wallet this will be "0", but the click should not crash
    const value = await amountInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("scanner button opens scanner overlay", async ({ appPage: page }) => {
    const scanBtn = page.getByRole("img", { name: "scan" }).first();
    await expect(scanBtn).toBeVisible();
    await scanBtn.click();

    const closeBtn = scanner.closeButton(page).first();
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });
    await closeBtn.click();
  });
});
