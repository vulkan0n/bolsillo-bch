// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { Clipboard } from "@capacitor/clipboard";

import WalletViewReceive from "./WalletViewReceive";

// Mock TransactionHistoryService to prevent actual SQLite calls
vi.mock("@/kernel/wallet/TransactionHistoryService", () => ({
  default: vi.fn(() => ({
    resolveTransactionHistory: vi.fn(() =>
      Promise.resolve({ transactions: [], hasMore: false, total: 0 })
    ),
  })),
}));

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// AddressManagerService — return a known test address
const mockGetReceiveAddresses = vi.fn(() => [
  {
    address: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
  },
]);

vi.mock("@/kernel/wallet/AddressManagerService", () => ({
  default: vi.fn(() => ({
    getReceiveAddresses: mockGetReceiveAddresses,
  })),
}));

// react-qrcode-logo uses canvas — mock to avoid jsdom limitations
vi.mock("react-qrcode-logo", () => ({
  QRCode: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value} />
  ),
}));

// NotificationService uses DOM portals — mock to keep tests isolated
const mockPaymentReceived = vi.fn();
vi.mock("@/kernel/app/NotificationService", () => ({
  default: vi.fn(() => ({
    clipboardCopy: vi.fn(),
    spawn: vi.fn(),
    paymentReceived: mockPaymentReceived,
  })),
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockStore(overrides?: { spendableBalance?: string }) {
  return configureStore({
    reducer: {
      wallet: () => ({
        walletHash: "test-hash",
        balance: overrides?.spendableBalance ?? "1000000",
        spendable_balance: overrides?.spendableBalance ?? "1000000",
      }),
      preferences: () => ({
        bchNetwork: "mainnet" as const,
        localCurrency: "ARS",
        qrCodeLogo: "bch",
        qrCodeBackground: "#ffffff",
        qrCodeForeground: "#23A06D",
      }),
    },
  });
}

function renderView() {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <WalletViewReceive />
      </MemoryRouter>
    </Provider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WalletViewReceive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ---------------- Phase 2: UI Layout

  it("renders the heading 'Recibir'", () => {
    renderView();
    expect(screen.getByText("Recibir")).toBeInTheDocument();
  });

  it("renders a back button with aria-label 'Volver'", () => {
    renderView();
    expect(screen.getByLabelText("Volver")).toBeInTheDocument();
  });

  it("renders a QR code with the correct BIP21 URI", () => {
    renderView();
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toHaveAttribute(
      "data-value",
      "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a"
    );
  });

  it("renders the wallet address on screen", () => {
    renderView();
    expect(
      screen.getByText("bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a")
    ).toBeInTheDocument();
  });

  it("renders a copy button", () => {
    renderView();
    expect(screen.getByLabelText("Copiar dirección")).toBeInTheDocument();
  });

  // ---------------- Phase 3: Interaction

  it("copies address to clipboard and shows feedback on button click", () => {
    renderView();

    const copyButton = screen.getByLabelText("Copiar dirección");
    fireEvent.click(copyButton);

    // Clipboard write was called with the address
    expect(Clipboard.write).toHaveBeenCalledWith({
      string: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
    });

    // Visual feedback: button shows "Copiado" after click
    expect(screen.getByText("Copiado")).toBeInTheDocument();
  });

  it("shows 'Copiar' text before any copy interaction", () => {
    renderView();
    expect(screen.getByText("Copiar")).toBeInTheDocument();
  });

  // ---------------- Edge cases

  it("handles empty address gracefully", () => {
    mockGetReceiveAddresses.mockReturnValueOnce([{ address: "" }]);

    renderView();

    // Should still render the UI without crashing
    expect(screen.getByText("Recibir")).toBeInTheDocument();
    expect(screen.getByLabelText("Copiar dirección")).toBeInTheDocument();

    // QR code value should use the empty string (not crash)
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toHaveAttribute("data-value", "bitcoincash:");
  });

  it("handles clipboard write error gracefully without crashing", async () => {
    Clipboard.write.mockRejectedValueOnce(new Error("Clipboard unavailable"));

    renderView();

    const copyButton = screen.getByLabelText("Copiar dirección");
    fireEvent.click(copyButton);

    // Visual feedback still shows "Copiado" — the UI update runs before the async clipboard call
    expect(screen.getByText("Copiado")).toBeInTheDocument();

    // Wait for the caught rejection to flush
    await vi.waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledTimes(1);
    });
  });

  it("renders with testnet prefix for chipnet network", () => {
    const store = configureStore({
      reducer: {
        wallet: () => ({
          walletHash: "test-hash",
          balance: "1000000",
          spendable_balance: "1000000",
        }),
        preferences: () => ({
          bchNetwork: "chipnet" as const,
          localCurrency: "ARS",
          qrCodeLogo: "bch",
          qrCodeBackground: "#ffffff",
          qrCodeForeground: "#23A06D",
        }),
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <WalletViewReceive />
        </MemoryRouter>
      </Provider>
    );

    const qrCode = screen.getByTestId("qr-code");
    const value = qrCode.getAttribute("data-value") || "";
    expect(value.startsWith("bchtest:")).toBe(true);
  });
});
