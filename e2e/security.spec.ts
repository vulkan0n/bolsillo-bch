import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";

test.describe("Security", () => {
  test("app boots without lock screen on web", async ({ appPage: page }) => {
    // On web stub, encryption is a no-op, so app boots directly
    // Lock screen elements should NOT be present
    const pinInput = page.locator(
      'input[type="password"][inputmode="numeric"]'
    );
    await expect(pinInput).not.toBeVisible();
  });

  test("security accordion is accessible", async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    // Click "Security" accordion button
    const securityBtn = page.locator("button", { hasText: "Security" });
    await expect(securityBtn).toBeVisible();
    await securityBtn.click();

    // Security content should expand (shows "Security Mode" label)
    await expect(
      page.getByText("Security Mode", { exact: false })
    ).toBeVisible({ timeout: 3_000 });
  });

  test("web stub shows encryption unavailable message", async ({
    appPage: page,
  }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    // Expand Security accordion
    const securityBtn = page.locator("button", { hasText: "Security" });
    await securityBtn.click();

    // Web stub shows info message about encryption not being available
    await expect(
      page.getByText("Encryption is not available on web", { exact: false })
    ).toBeVisible({ timeout: 3_000 });
  });

  test.skip(
    "forgot pin has import/reset options",
    async ({ appPage: page }) => {
      // Web stub cannot show lock screen (encryption always ready)
    }
  );

  test.skip(
    "nuclear wipe requires confirmation",
    async ({ appPage: page }) => {
      // Web stub cannot show lock screen (encryption always ready)
    }
  );

  test.skip(
    "import backup has fields",
    async ({ appPage: page }) => {
      // Web stub cannot show lock screen (encryption always ready)
    }
  );
});
