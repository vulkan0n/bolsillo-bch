import { test, expect } from "./helpers/fixtures";
import { nav, assetsPage } from "./helpers/selectors";

test.describe("Assets", () => {
  test.beforeEach(async ({ appPage: page }) => {
    await page.click(nav.assets);
    await page.waitForURL("**/assets/**");
  });

  test("assets page renders", async ({ appPage: page }) => {
    // Use .first() since the nav bar also has an assets/tokens link
    const tokensTab = page.locator(assetsPage.tokensTab).first();
    const coinsTab = page.locator(assetsPage.coinsTab).first();
    await expect(tokensTab).toBeVisible();
    await expect(coinsTab).toBeVisible();
  });

  test("tokens tab navigates", async ({ appPage: page }) => {
    const tokensTab = page.locator(assetsPage.tokensTab).first();
    await expect(tokensTab).toBeVisible();
    await tokensTab.click();
    await page.waitForURL("**/assets/tokens**");
  });

  test("coins tab navigates", async ({ appPage: page }) => {
    const coinsTab = page.locator(assetsPage.coinsTab).first();
    await expect(coinsTab).toBeVisible();
    await coinsTab.click();
    await page.waitForURL("**/assets/coins**");
  });
});
