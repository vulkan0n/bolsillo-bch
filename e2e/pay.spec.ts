import { test, expect } from "./helpers/fixtures";

test.describe("Pay (Invoice)", () => {
  test("pay page renders with request URL", async ({ appPage: page }) => {
    // Navigate to pay page with a dummy invoice URL
    await page.goto("/wallet/pay?r=https://example.com/invoice");

    // Should show "Payment To" header with hostname before fetch fails
    // OR the error message after fetch fails - either proves the page mounted
    const paymentHeader = page.getByText("Payment To", { exact: false });
    const errorHeader = page.getByText("Invalid", { exact: false });
    await expect(paymentHeader.or(errorHeader).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test.skip("instant pay works if enabled", async ({ appPage: page }) => {
    // Requires instant pay to be enabled and a valid invoice below threshold
  });

  test.skip("send works on pay page", async ({ appPage: page }) => {
    // Requires a valid invoice and sufficient funds
  });
});
