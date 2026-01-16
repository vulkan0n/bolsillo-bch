/**
 * Unit tests for uri.ts - BCH URI parsing and validation
 *
 * These tests are CRITICAL because:
 * - Incorrect URI parsing could cause payments to wrong addresses
 * - Amount parsing errors could result in wrong payment amounts
 * - WIF validation is used for wallet sweeping (importing funds)
 * - WalletConnect URI parsing enables dApp connections
 */

import { describe, it, expect } from "vitest";
import {
  validateBip21Uri,
  validateWifUri,
  validateWalletConnectUri,
  validateBchUri,
} from "./uri";

// Valid test addresses
const VALID_CASHADDR = "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
const VALID_CASHADDR_NO_PREFIX = "qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
const VALID_LEGACY = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2";

// Valid WIF (this is a well-known test WIF, DO NOT use for real funds)
const VALID_WIF = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ";

describe("uri.ts", () => {
  describe("validateBip21Uri", () => {
    describe("cashaddr validation", () => {
      it("validates cashaddr with prefix", () => {
        const result = validateBip21Uri(VALID_CASHADDR);
        expect(result.isBip21).toBe(true);
        expect(result.isCashAddress).toBe(true);
        expect(result.isBase58Address).toBe(false);
        expect(result.address).toBe(VALID_CASHADDR);
      });

      it("validates cashaddr without prefix", () => {
        const result = validateBip21Uri(VALID_CASHADDR_NO_PREFIX);
        expect(result.isBip21).toBe(true);
        expect(result.isCashAddress).toBe(true);
        // Should add the prefix
        expect(result.address).toContain("bitcoincash:");
      });

      it("validates legacy/base58 addresses", () => {
        const result = validateBip21Uri(VALID_LEGACY);
        expect(result.isBip21).toBe(true);
        expect(result.isBase58Address).toBe(true);
        expect(result.isCashAddress).toBe(false);
        expect(result.address).toBe(VALID_LEGACY);
      });
    });

    describe("BIP21 amount parsing", () => {
      it("parses amount from query string", () => {
        const uri = `${VALID_CASHADDR}?amount=1.5`;
        const result = validateBip21Uri(uri);
        expect(result.isBip21).toBe(true);
        expect(result.amount).toBe(1.5);
      });

      it("handles zero amount", () => {
        const uri = `${VALID_CASHADDR}?amount=0`;
        const result = validateBip21Uri(uri);
        expect(result.amount).toBe(0);
      });

      it("handles missing amount", () => {
        const result = validateBip21Uri(VALID_CASHADDR);
        expect(result.amount).toBe(0);
      });

      it("parses fractional BCH amounts", () => {
        const uri = `${VALID_CASHADDR}?amount=0.00001`;
        const result = validateBip21Uri(uri);
        expect(result.amount).toBe(0.00001);
      });
    });

    describe("CashToken parameters", () => {
      it("parses token category from query", () => {
        const tokenCategory =
          "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        const uri = `${VALID_CASHADDR}?c=${tokenCategory}`;
        const result = validateBip21Uri(uri);
        expect(result.tokenCategory).toBe(tokenCategory);
      });

      it("parses fungible token amount", () => {
        const uri = `${VALID_CASHADDR}?ft=1000`;
        const result = validateBip21Uri(uri);
        expect(result.tokenAmount).toBe(1000n);
      });
    });

    describe("edge cases", () => {
      it("rejects invalid addresses", () => {
        const result = validateBip21Uri("not-an-address");
        expect(result.isBip21).toBe(false);
        expect(result.address).toBe("");
      });

      it("handles double-prefixed addresses (bug in some wallets)", () => {
        const doublePrefix = `bitcoincash:bitcoincash:${VALID_CASHADDR_NO_PREFIX}`;
        const result = validateBip21Uri(doublePrefix);
        expect(result.isBip21).toBe(true);
      });

      it("handles prefix with legacy address (bug in some wallets)", () => {
        // Some wallets incorrectly add bitcoincash: to legacy addresses
        const badUri = `bitcoincash:${VALID_LEGACY}`;
        const result = validateBip21Uri(badUri);
        expect(result.isBip21).toBe(true);
        expect(result.isBase58Address).toBe(true);
      });
    });
  });

  describe("validateWifUri", () => {
    it("validates a correct WIF", () => {
      const result = validateWifUri(VALID_WIF);
      expect(result.isWif).toBe(true);
      expect(result.wif).toBe(VALID_WIF);
      expect(result.address).toMatch(/^bitcoincash:q/);
      expect(result.privateKey).toBeInstanceOf(Uint8Array);
    });

    it("validates WIF with bitcoincash: prefix", () => {
      const prefixedWif = `bitcoincash:${VALID_WIF}`;
      const result = validateWifUri(prefixedWif);
      expect(result.isWif).toBe(true);
      expect(result.wif).toBe(VALID_WIF); // prefix should be stripped
    });

    it("validates WIF with bch-wif: prefix", () => {
      const prefixedWif = `bch-wif:${VALID_WIF}`;
      const result = validateWifUri(prefixedWif);
      expect(result.isWif).toBe(true);
      expect(result.wif).toBe(VALID_WIF);
    });

    it("rejects invalid WIF", () => {
      const result = validateWifUri("not-a-wif");
      expect(result.isWif).toBe(false);
    });

    it("rejects addresses as WIF (they look similar)", () => {
      // Legacy addresses can look like WIFs but aren't
      const result = validateWifUri(VALID_LEGACY);
      expect(result.isWif).toBe(false);
    });
  });

  describe("validateWalletConnectUri", () => {
    it("validates WalletConnect v2 URI", () => {
      const wcUri = "wc:a1b2c3d4e5f6@2?relay-protocol=irn&symKey=abc123";
      const result = validateWalletConnectUri(wcUri);
      expect(result.isWalletConnect).toBe(true);
      expect(result.wcUri).toBe(wcUri);
    });

    it("rejects non-WalletConnect URIs", () => {
      const result = validateWalletConnectUri(VALID_CASHADDR);
      expect(result.isWalletConnect).toBe(false);
    });

    it("rejects http/https URIs", () => {
      const result = validateWalletConnectUri("https://example.com");
      expect(result.isWalletConnect).toBe(false);
    });
  });

  describe("validateBchUri (combined validator)", () => {
    it("identifies cashaddr as BIP21", () => {
      const result = validateBchUri(VALID_CASHADDR);
      expect(result.isValid).toBe(true);
      expect(result.isBip21).toBe(true);
    });

    it("identifies WIF correctly", () => {
      const result = validateBchUri(VALID_WIF);
      expect(result.isValid).toBe(true);
      expect(result.isWif).toBe(true);
    });

    it("identifies WalletConnect URI correctly", () => {
      const wcUri = "wc:abc123@2?relay-protocol=irn";
      const result = validateBchUri(wcUri);
      expect(result.isValid).toBe(true);
      expect(result.isWalletConnect).toBe(true);
    });

    it("identifies Payment Protocol URI", () => {
      const ppUri = "bitcoincash:?r=https://merchant.com/pay/123";
      const result = validateBchUri(ppUri);
      expect(result.isValid).toBe(true);
      expect(result.isPaymentProtocol).toBe(true);
    });

    it("rejects completely invalid input", () => {
      const result = validateBchUri("hello world");
      expect(result.isValid).toBe(false);
    });
  });
});
