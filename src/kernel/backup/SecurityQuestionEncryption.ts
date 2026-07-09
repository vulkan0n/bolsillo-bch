// --------------------------------

// PBKDF2-AES-256-GCM encryption utility for security question recovery.
// Password-based key derivation with 600k iterations matching native plugin's
// backup export. Salt is random per encryption, stored alongside the ciphertext.

export interface SecurityQuestionBlob {
  version: "1";
  algorithm: "PBKDF2-AES-256-GCM";
  /** base64, random 16 bytes */
  salt: string;
  /** base64, random 12 bytes */
  iv: string;
  /** base64, includes GCM auth tag (last 16 bytes) */
  ciphertext: string;
  /** PBKDF2 iterations: 600000 */
  iterations: number;
}

export interface SecurityQuestionData {
  question: string;
  questionCustom: boolean;
  blob: SecurityQuestionBlob;
  failedAttempts: number;
  /** ISO timestamp after which the user may retry, or null */
  lockedUntil: string | null;
}

// ----------------

/**
 * Normalize an answer by trimming whitespace and lowercasing.
 * Same normalization at encrypt and decrypt time ensures case-insensitive matching.
 */
export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

// ----------------

/**
 * Derive an AES-256-GCM key from a normalized answer using PBKDF2-SHA-256.
 * @param answer - normalized answer string
 * @param salt - 16 random bytes
 * @param iterations - PBKDF2 iterations (600000)
 * @param usage - "encrypt" or "decrypt"
 */
async function deriveKey(
  answer: string,
  salt: Uint8Array,
  iterations: number,
  usage: KeyUsage
): Promise<CryptoKey> {
  const enc = new TextEncoder();

  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(answer),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    [usage]
  );
}

// ----------------

/**
 * Encode a Uint8Array to a base64 string.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Decode a base64 string to a Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// ----------------

/**
 * Encrypt the mnemonic using the normalized answer.
 * Generates a random 16-byte salt and a random 12-byte IV.
 * Uses PBKDF2-SHA-256 (600k iterations) + AES-256-GCM.
 */
export async function encryptWithAnswer(
  mnemonic: string,
  answer: string
): Promise<SecurityQuestionBlob> {
  const normalized = normalizeAnswer(answer);
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const iterations = 600000;

  const cryptoKey = await deriveKey(normalized, salt, iterations, "encrypt");
  const encoded = new TextEncoder().encode(mnemonic);

  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  return {
    version: "1",
    algorithm: "PBKDF2-AES-256-GCM",
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertextBuffer)),
    iterations,
  };
}

// ----------------

/**
 * Decrypt the mnemonic using the normalized answer.
 * Throws if the answer is wrong (GCM auth tag validation fails) or if the
 * ciphertext has been tampered with.
 */
export async function decryptWithAnswer(
  blob: SecurityQuestionBlob,
  answer: string
): Promise<string> {
  const normalized = normalizeAnswer(answer);
  const salt = base64ToUint8Array(blob.salt);
  const iv = base64ToUint8Array(blob.iv);
  const ciphertext = base64ToUint8Array(blob.ciphertext);

  const cryptoKey = await deriveKey(
    normalized,
    salt,
    blob.iterations,
    "decrypt"
  );

  const plaintextBuffer = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext
  );

  return new TextDecoder().decode(plaintextBuffer);
}

// ----------------

/**
 * Calculate the current backoff delay in milliseconds based on failed attempts.
 * Formula: failedAttempts^2 seconds, capped at 1 hour.
 */
export function getBackoffMs(failedAttempts: number): number {
  const seconds = Math.min(failedAttempts * failedAttempts, 3600);
  return seconds * 1000;
}

/**
 * Check whether the user is currently locked out based on the lockedUntil timestamp.
 */
export function isLockedOut(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return Date.now() < new Date(lockedUntil).getTime();
}

/**
 * Calculate the remaining lockout time in seconds.
 */
export function getRemainingLockoutSeconds(lockedUntil: string | null): number {
  if (!lockedUntil) return 0;
  const remaining = new Date(lockedUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}
