/**
 * App Store / Play Store screenshot generation via Playwright.
 *
 * Run:   npx playwright test e2e/screenshots.spec.ts
 * Output: android/metadata screenshot directories
 *
 * Uses 2x device pixel ratio to produce store-quality images.
 * Android: 1440x3200 (720x1600 viewport @ 2x)
 * iOS:     1290x2796 (430x932 viewport @ 3x)
 */
import { test as base, type Page } from "@playwright/test";
import { waitForAppReady } from "./helpers/wallet";
import { nav } from "./helpers/selectors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANDROID_DIR = path.join(
  __dirname,
  "../android/metadata/android/en-US/images/phoneScreenshots"
);

const test = base.extend<{ appPage: Page }>({
  appPage: async ({ page }, use) => {
    await page.goto("/");
    await waitForAppReady(page);
    await use(page);
  },
});

// Wait for content to settle (animations, data loading)
async function settle(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
}

test.describe("Store Screenshots", () => {
  test("1 - Wallet home (receive)", async ({ appPage: page }) => {
    await settle(page);
    await page.screenshot({ path: `${ANDROID_DIR}/1_en-US.png` });
  });

  test("2 - Send screen", async ({ appPage: page }) => {
    await page.locator('[role="img"][aria-label="send"]').click();
    await page.waitForURL("**/wallet/send**");
    await settle(page);
    await page.screenshot({ path: `${ANDROID_DIR}/2_en-US.png` });
  });

  test("3 - Transaction history", async ({ appPage: page }) => {
    await page.locator('[role="img"][aria-label="history"]').click();
    await page.waitForURL("**/wallet/history**");
    await settle(page);
    await page.screenshot({ path: `${ANDROID_DIR}/3_en-US.png` });
  });

  test("4 - Explore tab", async ({ appPage: page }) => {
    await page.click(nav.explore);
    await page.waitForURL("**/explore**");
    await settle(page);
    await page.screenshot({ path: `${ANDROID_DIR}/4_en-US.png` });
  });

  test("5 - Settings", async ({ appPage: page }) => {
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");
    await settle(page);
    await page.screenshot({ path: `${ANDROID_DIR}/5_en-US.png` });
  });
});
