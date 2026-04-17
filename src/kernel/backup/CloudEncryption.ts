import hkdf from "futoin-hkdf";

// --------------------------------

// Salt fijo de la app — no es un secreto, su función es separar el dominio
// de derivación de otras posibles aplicaciones que usen el mismo Google sub.
const APP_SALT = "bolsillo-bch.v1.cloud-backup";
const APP_INFO = "bolsillo-bch.v1.derive-encryption-key";

// ----------------

// Formato del backup encriptado guardado en Google Drive.
export interface EncryptedBackup {
  version: "1";
  algorithm: "AES-256-GCM";
  // nonce de 12 bytes en base64 (requerido por GCM)
  iv: string;
  // ciphertext + authTag (16 bytes) concatenados, en base64
  ciphertext: string;
}

// --------------------------------

/**
 * Deriva una clave AES-256 determinística a partir del Google User ID.
 * Misma cuenta → misma clave → puede desencriptar en cualquier dispositivo.
 */
function deriveKey(googleUserId: string): ArrayBuffer {
  const buf: Buffer = hkdf(Buffer.from(googleUserId, "utf8"), 32, {
    salt: APP_SALT,
    info: APP_INFO,
    hash: "SHA-256",
  });
  // Slice produces a plain ArrayBuffer (no SharedArrayBuffer) requerido por Web Crypto
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

// ----------------

/**
 * Encripta el mnemónico con AES-256-GCM.
 * IV aleatorio en cada llamada — el archivo guardado en Drive siempre es distinto.
 */
export async function encryptMnemonic(
  mnemonic: string,
  googleUserId: string
): Promise<EncryptedBackup> {
  const keyBytes = deriveKey(googleUserId);

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(mnemonic);

  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  return {
    version: "1",
    algorithm: "AES-256-GCM",
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(
      String.fromCharCode(...new Uint8Array(ciphertextBuffer))
    ),
  };
}

// ----------------

/**
 * Desencripta un backup previamente generado por encryptMnemonic.
 * Lanza si el backup fue manipulado (authTag inválido) o el userId es incorrecto.
 */
export async function decryptMnemonic(
  backup: EncryptedBackup,
  googleUserId: string
): Promise<string> {
  const keyBytes = deriveKey(googleUserId);

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = Uint8Array.from(atob(backup.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(backup.ciphertext), (c) =>
    c.charCodeAt(0)
  );

  const plaintextBuffer = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext
  );

  return new TextDecoder().decode(plaintextBuffer);
}
