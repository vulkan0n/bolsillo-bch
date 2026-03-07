/**
 * Wallet helpers for E2E tests.
 * Handles wallet import, network switching, and sync waiting.
 */
import { type Page, expect } from "@playwright/test";
import { nav } from "./selectors";

/** Read mainnet mnemonic; returns undefined if not set (tests should skip). */
export function getMainnetMnemonic(): string | undefined {
  return process.env.E2E_MAINNET_MNEMONIC;
}

/**
 * Wait for the app to fully boot (past lock screen, into wallet view).
 * On web stub, encryption is a no-op, so the app boots directly.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForSelector(nav.wallet, { timeout: 30_000 });
}

/**
 * Wait for the wallet to finish syncing with Electrum.
 * Looks for the sync indicator to stop spinning.
 */
export async function waitForSync(page: Page): Promise<void> {
  const indicator = page.locator('[data-testid="sync-indicator"]');
  const isPresent = await indicator.isVisible({ timeout: 5_000 }).catch(() => false);
  if (isPresent) {
    await expect(indicator).toHaveAttribute("data-syncing", "false", {
      timeout: 30_000,
    });
  }
}

/**
 * Expand a settings accordion by clicking its button header.
 * Accordion titles are rendered inside <button> elements.
 */
async function expandAccordion(page: Page, title: string): Promise<void> {
  const accordion = page.locator("button", { hasText: title });
  await accordion.click();
}

/**
 * Switch to chipnet network via the Debug page.
 * Network switching is in DebugSettings (not the regular Network accordion).
 * After selecting chipnet, the app reloads via window.location.assign("/").
 */
export async function switchToChipnet(page: Page): Promise<void> {
  // Navigate to debug page where network switching is available
  await page.goto("/debug");

  // Expand "Debug Options" accordion
  const debugAccordion = page.locator("button", { hasText: "Debug Options" });
  await expect(debugAccordion).toBeVisible({ timeout: 10_000 });
  await debugAccordion.click();

  // Change network to chipnet via the BCH Network select dropdown
  const networkSelect = page.locator("select").first();
  await expect(networkSelect).toBeVisible({ timeout: 5_000 });

  // Selecting chipnet triggers window.location.assign("/") causing a reload
  await networkSelect.selectOption("chipnet");

  // Wait for the app to fully reboot after network change
  await waitForAppReady(page);
}

/**
 * Import a wallet from mnemonic via the wallet wizard.
 */
export async function importWallet(
  page: Page,
  mnemonic: string
): Promise<void> {
  await page.click(nav.settings);
  await page.waitForURL("**/settings");

  // Expand "Wallets" accordion to reveal "Create/Import Wallet" link
  await expandAccordion(page, "Wallets");

  const newWalletBtn = page.getByText("Create/Import Wallet", { exact: false });
  await newWalletBtn.click();
  await page.waitForURL("**/settings/wallet/wizard**");

  const importBtn = page.getByRole("button", { name: /Import Wallet/i });
  await importBtn.click();
  await page.waitForURL("**/settings/wallet/wizard/import**");

  const mnemonicInput = page.locator("textarea");
  await mnemonicInput.fill(mnemonic);

  const confirmBtn = page.getByRole("button", { name: /Import Wallet/i });
  await confirmBtn.click();

  // Wait for wallet build — the app navigates away from wizard when done
  await page.waitForFunction(
    () => !window.location.pathname.includes("/wizard"),
    { timeout: 30_000 }
  );
  await waitForSync(page);

  await page.click(nav.wallet);
}

/**
 * Navigate to the wallet view (home/receive screen).
 */
export async function goToWallet(page: Page): Promise<void> {
  await page.click(nav.wallet);
  await page.waitForURL("**/wallet**");
}

/**
 * Get the currently displayed address text from the wallet view.
 */
export async function getDisplayedAddress(page: Page): Promise<string> {
  const addressEl = page.locator('[data-testid="address-display"]');
  return (await addressEl.textContent()) || "";
}

/**
 * Find a form control inside an AccordionChild by its label text.
 *
 * AccordionChild DOM: div.p-2.5 > div.flex > [label div, control div]
 * getByText matches the label div, two parent levels reaches the flex wrapper
 * which contains both the label and the control as descendants.
 */
export function accordionControl(
  page: Page,
  labelText: string,
  controlSelector: string
) {
  return page
    .getByText(labelText, { exact: false })
    .locator("../..")
    .locator(controlSelector);
}
