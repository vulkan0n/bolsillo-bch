import { describe, it, expect } from "vitest";
import { encryptMnemonic, decryptMnemonic } from "./CloudEncryption";

const MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const USER_ID = "1234567890";
const OTHER_USER_ID = "0987654321";

describe("CloudEncryption", () => {
  it("encrypts and decrypts a mnemonic correctly", async () => {
    const backup = await encryptMnemonic(MNEMONIC, USER_ID);
    const result = await decryptMnemonic(backup, USER_ID);
    expect(result).toBe(MNEMONIC);
  });

  it("produces different ciphertext each call (random IV)", async () => {
    const backup1 = await encryptMnemonic(MNEMONIC, USER_ID);
    const backup2 = await encryptMnemonic(MNEMONIC, USER_ID);
    expect(backup1.ciphertext).not.toBe(backup2.ciphertext);
    expect(backup1.iv).not.toBe(backup2.iv);
  });

  it("fails to decrypt with a different userId", async () => {
    const backup = await encryptMnemonic(MNEMONIC, USER_ID);
    await expect(decryptMnemonic(backup, OTHER_USER_ID)).rejects.toThrow();
  });

  it("fails to decrypt a tampered ciphertext", async () => {
    const backup = await encryptMnemonic(MNEMONIC, USER_ID);
    // Flip one character in the ciphertext
    const tampered = {
      ...backup,
      ciphertext: backup.ciphertext.slice(0, -4) + "AAAA",
    };
    await expect(decryptMnemonic(tampered, USER_ID)).rejects.toThrow();
  });

  it("backup has expected structure", async () => {
    const backup = await encryptMnemonic(MNEMONIC, USER_ID);
    expect(backup.version).toBe("1");
    expect(backup.algorithm).toBe("AES-256-GCM");
    expect(typeof backup.iv).toBe("string");
    expect(typeof backup.ciphertext).toBe("string");
  });
});
