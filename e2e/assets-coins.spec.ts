import { test, expect } from "./helpers/fixtures";
import { nav, assetsPage } from "./helpers/selectors";

test.describe("Assets: Coins Tab", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.assets);
    await page.waitForURL("**/assets/**");

    const coinsTab = page.locator(assetsPage.coinsTab).first();
    await coinsTab.click();
    await page.waitForURL("**/assets/coins**");
  });

  test("coins tab renders with balance header or empty state", async ({
    appPage: page,
  }) => {
    // Fresh wallet shows "No Coins" empty state; funded wallet shows "Cash Balance"
    const cashBalance = page.getByText("Cash Balance", { exact: false });
    const noCoins = page.getByText("No Coins", { exact: false });

    await expect(cashBalance.or(noCoins).first()).toBeVisible({
      timeout: 5_000,
    });
  });
});

test.describe("Assets: Tokens Tab", () => {
  test("tokens tab shows empty state for fresh wallet", async ({
    appPage: page,
  }) => {
    await page.click(nav.assets);
    await page.waitForURL("**/assets/**");

    const tokensTab = page.locator(assetsPage.tokensTab).first();
    await tokensTab.click();
    await page.waitForURL("**/assets/tokens**");

    // Fresh wallet shows "No Tokens" empty state
    const noTokens = page.getByText("No Tokens", { exact: false });
    await expect(noTokens).toBeVisible({ timeout: 5_000 });
  });
});
