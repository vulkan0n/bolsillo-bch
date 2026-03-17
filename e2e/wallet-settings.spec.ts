import { test, expect } from "./helpers/fixtures";
import { walletView } from "./helpers/selectors";

test.describe("Wallet Settings", () => {
  test.beforeEach(async ({ appPage: page }) => {
    const walletNameLink = page.locator(walletView.walletNameLink);
    await expect(walletNameLink).toBeVisible();
    await walletNameLink.click();
    await page.waitForURL("**/settings/wallet/**");
  });

  test("page renders", async ({ appPage: page }) => {
    expect(page.url()).toContain("/settings/wallet/");
    await expect(page.getByText("Wallet Info", { exact: false })).toBeVisible();
  });

  test("rename via blur", async ({ appPage: page }) => {
    // Click the edit icon to switch to input mode
    const editIcon = page.locator('[role="img"][aria-label="edit"]');
    await expect(editIcon).toBeVisible();
    await editIcon.click();

    // Now the input should be visible
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    const originalName = await nameInput.inputValue();

    await nameInput.fill("Test Wallet E2E");
    await nameInput.blur();

    // After blur+confirm, Editable shows the new name as text
    await expect(page.getByText("Test Wallet E2E")).toBeVisible();

    // Click the wallet name text to re-enter edit mode
    await page.getByText("Test Wallet E2E").click();
    const input2 = page.locator('input[type="text"]').first();
    await expect(input2).toHaveValue("Test Wallet E2E");

    // Restore original name
    await input2.fill(originalName);
    await input2.blur();
  });

  test("rename via enter", async ({ appPage: page }) => {
    const editIcon = page.locator('[role="img"][aria-label="edit"]');
    await expect(editIcon).toBeVisible();
    await editIcon.click();

    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    const originalName = await nameInput.inputValue();

    await nameInput.fill("Test Wallet Enter");
    await nameInput.press("Enter");

    // After Enter+confirm, Editable shows the new name as text
    await expect(page.getByText("Test Wallet Enter")).toBeVisible();

    // Click to re-enter edit mode and restore
    await page.getByText("Test Wallet Enter").click();
    const input2 = page.locator('input[type="text"]').first();
    await expect(input2).toHaveValue("Test Wallet Enter");

    await input2.fill(originalName);
    await input2.press("Enter");
  });
});
