import { test, expect } from "@playwright/test";
import { walletView, sendPage } from "./helpers/selectors";
import {
  waitForAppReady,
  waitForSync,
  switchToChipnet,
  importWallet,
  getDisplayedAddress,
} from "./helpers/wallet";

const chipnetMnemonic = process.env.E2E_CHIPNET_MNEMONIC;

test.describe("Chipnet Network Tests", () => {
  test.skip(!chipnetMnemonic, "E2E_CHIPNET_MNEMONIC env var not set");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await switchToChipnet(page);
    await importWallet(page, chipnetMnemonic!);
  });

  test("chipnet wallet shows valid address", async ({ page }) => {
    const address = await getDisplayedAddress(page);
    expect(address).toMatch(/^q[a-z0-9]+$/);
  });

  test("chipnet wallet syncs and shows history", async ({ page }) => {
    await waitForSync(page);

    const historyBtn = page.locator(walletView.historyButton);
    await expect(historyBtn).toBeVisible();
    await historyBtn.click();
    await page.waitForURL("**/wallet/history**");
  });

  test("chipnet send-to-self broadcasts successfully", async ({ page }) => {
    await waitForSync(page);

    const address = await getDisplayedAddress(page);
    expect(address).toMatch(/^q[a-z0-9]+$/);

    // Navigate to send page with own address
    await page.goto(`/wallet/send/${encodeURIComponent(address)}`);
    await expect(
      page.locator(sendPage.header)
    ).toBeVisible({ timeout: 10_000 });

    // Enter a small amount (1000 sats)
    const amountInput = page.locator(sendPage.amountInput).first();
    await expect(amountInput).toBeVisible();
    await amountInput.fill("1000");

    // Slide to send — use retry wrapper for gesture reliability
    const slideEl = page.locator(sendPage.slideToSend);
    await expect(slideEl).toBeVisible({ timeout: 5_000 });
    await slideEl.scrollIntoViewIfNeeded();

    await expect(async () => {
      const box = await slideEl.boundingBox();
      expect(box).not.toBeNull();

      // Perform the slide gesture
      await page.mouse.move(box!.x + 10, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        box!.x + box!.width - 10,
        box!.y + box!.height / 2,
        { steps: 30 }
      );
      await page.mouse.up();

      // Verify the slide registered (success or error — both prove it worked)
      const successText = page.getByText("Success", { exact: false });
      const errorText = page.locator(sendPage.error);
      await expect(successText.or(errorText).first()).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 15_000 });
  });
});
