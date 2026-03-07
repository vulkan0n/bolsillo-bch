import { test, expect } from "./helpers/fixtures";
import { walletView } from "./helpers/selectors";
import { getDisplayedAddress } from "./helpers/wallet";

test.describe("Wallet View (Receive Screen)", () => {
  test("app boots to receive screen", async ({ appPage: page }) => {
    await expect(
      page.getByText("Receive", { exact: true }).first()
    ).toBeVisible();
  });

  test("address is displayed", async ({ appPage: page }) => {
    const addressEl = page.locator(walletView.addressDisplay);
    await expect(addressEl).toBeVisible();
    const address = await getDisplayedAddress(page);
    expect(address.length).toBeGreaterThan(0);
    expect(address).toMatch(/^q[a-z0-9]+$/);
  });

  test("address format is valid cashaddr", async ({ appPage: page }) => {
    const address = await getDisplayedAddress(page);
    // CashAddr charset: qpzry9x8gf2tvdw0s3jn54khce6mua7l
    expect(address).toMatch(/^q[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
    expect(address.length).toBeGreaterThanOrEqual(34);
  });

  test("QR code is displayed", async ({ appPage: page }) => {
    const qrBtn = page.locator(walletView.qrButton);
    await expect(qrBtn).toBeVisible();
  });

  test("receive tokens toggle updates address", async ({
    appPage: page,
  }) => {
    const addressBefore = await getDisplayedAddress(page);

    const checkbox = page.locator(walletView.receiveTokensCheckbox);
    await expect(checkbox).toBeVisible();
    await checkbox.click();

    // Wait for address to change (token address differs from standard)
    const addressEl = page.locator(walletView.addressDisplay);
    await expect(addressEl).not.toHaveText(addressBefore);

    const addressAfter = await getDisplayedAddress(page);
    expect(addressAfter).not.toBe(addressBefore);

    // Toggle back
    await checkbox.click();
    await expect(addressEl).toHaveText(addressBefore);
  });

  test("request amount shows input", async ({ appPage: page }) => {
    const trigger = page.locator(walletView.requestAmountTrigger);
    await expect(trigger).toBeVisible();
    await trigger.click();

    const input = page.locator(walletView.requestAmountInput).first();
    await expect(input).toBeVisible();
  });

  test("eyeball button toggles privacy mode", async ({ appPage: page }) => {
    const hideBtn = page.locator(walletView.balanceHideButton).first();
    await expect(hideBtn).toBeVisible();
    await hideBtn.click();

    // Balance should be hidden
    const balanceArea = page.locator(walletView.balanceArea);
    await expect(balanceArea).toHaveAttribute("data-hidden", "true");

    // Click balance area to undo privacy mode
    await balanceArea.click();
    await expect(balanceArea).toHaveAttribute("data-hidden", "false");
  });

  test("tapping balance swaps currency display", async ({
    appPage: page,
  }) => {
    const balanceArea = page.locator(walletView.balanceArea);
    await expect(balanceArea).toBeVisible();
    const textBefore = await balanceArea.textContent();
    await balanceArea.click();
    await expect(balanceArea).not.toHaveText(textBefore!);
  });

  test("wallet name navigates to wallet settings", async ({
    appPage: page,
  }) => {
    const walletNameLink = page.locator(walletView.walletNameLink);
    await expect(walletNameLink).toBeVisible();
    await walletNameLink.click();
    await page.waitForURL("**/settings/wallet/**");
  });

  test("history button navigates", async ({ appPage: page }) => {
    const historyBtn = page.locator(walletView.historyButton);
    await expect(historyBtn).toBeVisible();
    await historyBtn.click();
    await page.waitForURL("**/wallet/history");
  });

  test("send button navigates", async ({ appPage: page }) => {
    const sendBtn = page.locator(walletView.sendButton);
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await page.waitForURL("**/wallet/send**");
  });
});
