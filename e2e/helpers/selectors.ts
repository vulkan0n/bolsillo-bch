/**
 * Page object selectors for Selene Wallet E2E tests.
 * Uses data-testid attributes and ARIA roles for stability.
 */

// Bottom navigation tabs
export const nav = {
  wallet: 'a[href="/wallet"]',
  assets: 'a[href*="/assets"]',
  explore: 'a[href="/explore"]',
  settings: 'a[href="/settings"]',
};

// Wallet view (receive/home screen)
export const walletView = {
  balanceHideButton:
    '[role="img"][aria-label="eye"], [role="img"][aria-label="eye-invisible"]',
  balanceArea: '[data-testid="balance-area"]',
  walletNameLink: '[data-testid="wallet-name-link"]',
  qrButton: '[data-testid="qr-button"]',
  addressDisplay: '[data-testid="address-display"]',
  requestAmountTrigger: '[data-testid="request-amount"]',
  requestAmountInput: 'input[inputMode="decimal"]',
  receiveTokensCheckbox: '[data-testid="receive-tokens"]',
  historyButton: '[role="img"][aria-label="history"]',
  scannerButton: '[role="img"][aria-label="scan"]',
  sendButton: '[role="img"][aria-label="send"]',
};

// Send page
export const sendPage = {
  header: '[data-testid="send-header"]',
  error: '[data-testid="send-error"]',
  amountInput: 'input[inputMode="decimal"]',
  slideToSend: '[data-testid="slide-to-action"]',
  backButton: '[role="img"][aria-label="arrow-left"]',
};

// History page
export const historyPage = {
  container: '[data-testid="history-view"]',
  transactionLink: 'a[href*="/explore/tx/"]',
};

// Settings page
export const settingsPage = {
  container: '[data-testid="settings-view"]',
};

// Wallet settings
export const walletSettings = {
  walletNameInput: 'input[type="text"]',
};

// Assets page
export const assetsPage = {
  tokensTab: 'a[href*="/assets/tokens"]',
  coinsTab: 'a[href*="/assets/coins"]',
};

// Scanner overlay
export const scanner = {
  closeButton: '[role="img"][aria-label="close"]',
};
