import { test, expect } from "./helpers/fixtures";
import { sweepPage } from "./helpers/selectors";

test.describe("Sweep", () => {
  test("sweep page renders with WIF param", async ({ appPage: page }) => {
    // Navigate to sweep page with a dummy WIF
    // The component will attempt to validate and resolve the WIF,
    // showing either the sweep UI or an error message
    await page.goto("/wallet/sweep/5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ");

    // Should show either "Sweeping From" header or an error
    const sweepHeader = page.getByText("Sweeping From", { exact: false });
    const errorBanner = page.locator(sweepPage.error);
    await expect(sweepHeader.or(errorBanner).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test.skip("instant sweep respects threshold", () => {
    // Requires instant pay enabled + a WIF key with balance below threshold
  });

  test.skip("sweep sends funds to wallet", () => {
    // Requires a funded WIF key; would consume funds on each run
  });
});
