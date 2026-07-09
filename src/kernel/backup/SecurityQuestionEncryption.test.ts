import { describe, it, expect } from "vitest";

import {
  normalizeAnswer,
  encryptWithAnswer,
  decryptWithAnswer,
  getBackoffMs,
  isLockedOut,
  getRemainingLockoutSeconds,
} from "./SecurityQuestionEncryption";

const MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const ANSWER = "My Dog Rex!";

// ----------------
// normalizeAnswer
// ----------------

describe("normalizeAnswer", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeAnswer("  hello  ")).toBe("hello");
  });

  it("lowercases the string", () => {
    expect(normalizeAnswer("HELLO")).toBe("hello");
  });

  it("trims and lowercases", () => {
    expect(normalizeAnswer("  MY DOG REX!  ")).toBe("my dog rex!");
  });

  it("handles unicode characters", () => {
    expect(normalizeAnswer("  CaFé  ")).toBe("café");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeAnswer("   ")).toBe("");
  });
});

// ----------------
// encryptWithAnswer / decryptWithAnswer
// ----------------

describe("encrypt/decrypt roundtrip", () => {
  it("returns the mnemonic when correct answer is provided", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    const result = await decryptWithAnswer(blob, ANSWER);
    expect(result).toBe(MNEMONIC);
  });

  it("throws when wrong answer is provided", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    await expect(decryptWithAnswer(blob, "wrong answer")).rejects.toThrow();
  });

  it("handles case-insensitive answers", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    const result = await decryptWithAnswer(blob, "my dog rex!");
    expect(result).toBe(MNEMONIC);
  });

  it("handles case-insensitive answers with extra whitespace", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    const result = await decryptWithAnswer(blob, "  MY DOG REX!  ");
    expect(result).toBe(MNEMONIC);
  });

  it("produces different ciphertext each call (random salt and IV)", async () => {
    const blob1 = await encryptWithAnswer(MNEMONIC, ANSWER);
    const blob2 = await encryptWithAnswer(MNEMONIC, ANSWER);
    expect(blob1.salt).not.toBe(blob2.salt);
    expect(blob1.iv).not.toBe(blob2.iv);
    expect(blob1.ciphertext).not.toBe(blob2.ciphertext);
  });

  it("fails to decrypt with tampered ciphertext", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    const tampered = {
      ...blob,
      ciphertext: blob.ciphertext.slice(0, -4) + "AAAA",
    };
    await expect(decryptWithAnswer(tampered, ANSWER)).rejects.toThrow();
  });

  it("fails to decrypt with wrong salt", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    const wrongSalt = btoa("AAAAAAAAAAAAAAAA"); // 16 arbitrary bytes
    const tampered = {
      ...blob,
      salt: wrongSalt,
    };
    await expect(decryptWithAnswer(tampered, ANSWER)).rejects.toThrow();
  });

  it("blob has expected structure", async () => {
    const blob = await encryptWithAnswer(MNEMONIC, ANSWER);
    expect(blob.version).toBe("1");
    expect(blob.algorithm).toBe("PBKDF2-AES-256-GCM");
    expect(blob.iterations).toBe(600000);
    expect(typeof blob.salt).toBe("string");
    expect(typeof blob.iv).toBe("string");
    expect(typeof blob.ciphertext).toBe("string");
  });
});

// ----------------
// getBackoffMs
// ----------------

describe("getBackoffMs", () => {
  it("returns 0 for 0 attempts", () => {
    expect(getBackoffMs(0)).toBe(0);
  });

  it("returns 1000 for 1 attempt (1^2 = 1 second)", () => {
    expect(getBackoffMs(1)).toBe(1000);
  });

  it("returns 4000 for 2 attempts (2^2 = 4 seconds)", () => {
    expect(getBackoffMs(2)).toBe(4000);
  });

  it("caps at 3600000 (1 hour) for 60+ attempts", () => {
    expect(getBackoffMs(60)).toBe(3600000);
    expect(getBackoffMs(100)).toBe(3600000);
  });
});

// ----------------
// isLockedOut / getRemainingLockoutSeconds
// ----------------

describe("isLockedOut", () => {
  it("returns false when lockedUntil is null", () => {
    expect(isLockedOut(null)).toBe(false);
  });

  it("returns false when lockedUntil is in the past", () => {
    expect(isLockedOut(new Date(Date.now() - 10000).toISOString())).toBe(false);
  });

  it("returns true when lockedUntil is in the future", () => {
    expect(isLockedOut(new Date(Date.now() + 10000).toISOString())).toBe(true);
  });
});

describe("getRemainingLockoutSeconds", () => {
  it("returns 0 for null lockedUntil", () => {
    expect(getRemainingLockoutSeconds(null)).toBe(0);
  });

  it("returns 0 for past timestamp", () => {
    const past = new Date(Date.now() - 5000).toISOString();
    expect(getRemainingLockoutSeconds(past)).toBe(0);
  });

  it("returns positive for future timestamp", () => {
    const future = new Date(Date.now() + 5000).toISOString();
    const remaining = getRemainingLockoutSeconds(future);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(6);
  });
});
