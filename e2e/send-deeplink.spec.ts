import { test, expect } from "./helpers/fixtures";
import { sendPage } from "./helpers/selectors";

test.describe("Send Deep Link", () => {
  test("deep-link to send page with address", async ({ appPage: page }) => {
    // Navigate directly to send page with a valid-format cashaddr
    await page.goto(
      "/wallet/send/qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a"
    );

    // The send header should be visible (proves the page mounted with address)
    const header = page.locator(sendPage.header);
    await expect(header).toBeVisible({ timeout: 10_000 });

    // "Sending to" text should be visible (normal header, not error)
    await expect(
      page.getByText("Sending to", { exact: false })
    ).toBeVisible();
  });

  test("deep-link to send page without address", async ({
    appPage: page,
  }) => {
    await page.goto("/wallet/send/");

    // Send header should be visible
    const header = page.locator(sendPage.header);
    await expect(header).toBeVisible({ timeout: 10_000 });

    // The Editable input should be in edit mode (open, ready for input)
    const addressInput = page.locator("input").first();
    await expect(addressInput).toBeVisible();

    // Amount input should also be present
    const amountInput = page.locator('input[inputMode="decimal"]').first();
    await expect(amountInput).toBeVisible();
  });
});
