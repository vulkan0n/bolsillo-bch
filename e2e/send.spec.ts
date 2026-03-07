import { test, expect } from "./helpers/fixtures";
import { walletView, sendPage } from "./helpers/selectors";

test.describe("Send", () => {
  test.beforeEach(async ({ appPage: page }) => {
    const sendBtn = page.locator(walletView.sendButton);
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await page.waitForURL("**/wallet/send**");
  });

  test("send page renders", async ({ appPage: page }) => {
    const header = page.locator(sendPage.header);
    await expect(header).toBeVisible();
  });

  test("address input and amount input are accessible", async ({
    appPage: page,
  }) => {
    // Address Editable input should be present (open by default)
    const addressInput = page.locator("input").first();
    await expect(addressInput).toBeVisible();

    // Amount input should also be present
    const amountInput = page.locator(sendPage.amountInput).first();
    await expect(amountInput).toBeVisible();
  });

  test("back button works", async ({ appPage: page }) => {
    const backBtn = page.locator(sendPage.backButton);
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForURL("**/wallet**");
    await expect(
      page.getByText("Receive", { exact: true }).first()
    ).toBeVisible();
  });

  test("large amount shows error styling", async ({ appPage: page }) => {
    const amountInput = page.locator(sendPage.amountInput).first();
    await expect(amountInput).toBeVisible();
    await amountInput.fill("999999999");
    // Insufficient funds should add text-error class to the input
    await expect(amountInput).toHaveClass(/text-error/);
  });

  test("slide-to-send visible", async ({ appPage: page }) => {
    const slide = page.locator(sendPage.slideToSend);
    await expect(slide).toBeVisible();
  });
});
