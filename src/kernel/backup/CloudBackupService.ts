import { store } from "@/redux";
import { selectActiveWalletHash } from "@/redux/wallet";

import LogService from "@/kernel/app/LogService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import { encryptMnemonic, decryptMnemonic } from "./CloudEncryption";
import { uploadBackup, downloadBackup, hasBackup } from "./GoogleDriveService";
import { signIn, signOut, type GoogleUser } from "./GoogleAuthService";

const Log = LogService("CloudBackup");

// --------------------------------

export interface BackupResult {
  isSuccess: boolean;
  error?: string;
}

export interface RestoreResult {
  isSuccess: boolean;
  /** El walletHash de la wallet restaurada, para activarla en el boot. */
  walletHash?: string;
  error?: string;
}

// --------------------------------

/**
 * Inicia sesión con Google. Retorna los datos del usuario.
 * El accessToken incluye el scope drive.appdata.
 */
export async function googleSignIn(): Promise<GoogleUser> {
  return signIn();
}

// ----------------

export { signOut as googleSignOut };

// --------------------------------

/**
 * Verifica si ya existe un backup en Drive para la cuenta que acaba de iniciar sesión.
 * Llamar después de googleSignIn().
 */
export async function checkHasBackup(accessToken: string): Promise<boolean> {
  return hasBackup(accessToken);
}

// --------------------------------

/**
 * Crea un backup encriptado del mnemónico activo y lo sube a Google Drive.
 * Llamar después del onboarding inicial o cuando el usuario lo solicite.
 */
export async function backupActiveWallet(
  userId: string,
  accessToken: string
): Promise<BackupResult> {
  try {
    const walletHash = selectActiveWalletHash(store.getState());

    if (!walletHash) {
      throw new Error("No hay wallet activa para respaldar");
    }

    const WalletManager = WalletManagerService();
    const wallet = WalletManager.getWallet(walletHash);

    if (!wallet.mnemonic) {
      throw new Error("No se pudo obtener el mnemónico de la wallet");
    }

    Log.info("Encrypting mnemonic for cloud backup");
    const encrypted = await encryptMnemonic(wallet.mnemonic, userId);

    Log.info("Uploading backup to Google Drive");
    await uploadBackup(encrypted, accessToken);

    Log.info("Backup completed successfully");
    return { isSuccess: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    Log.error("Backup failed:", error);
    return { isSuccess: false, error };
  }
}

// --------------------------------

/**
 * Descarga el backup de Drive, desencripta el mnemónico e importa la wallet.
 * Llamar cuando el usuario elige "Restaurar" en el onboarding.
 *
 * @returns walletHash de la wallet restaurada para pasárselo al boot().
 */
export async function restoreFromBackup(
  userId: string,
  accessToken: string
): Promise<RestoreResult> {
  try {
    Log.info("Downloading backup from Google Drive");
    const backup = await downloadBackup(accessToken);

    if (!backup) {
      throw new Error("No se encontró ningún backup en Google Drive");
    }

    Log.info("Decrypting mnemonic");
    const mnemonic = await decryptMnemonic(backup, userId);

    Log.info("Importing wallet from restored mnemonic");
    const WalletManager = WalletManagerService();
    const restoredHash = await WalletManager.importWallet({
      mnemonic,
      name: "Mi Billetera",
      passphrase: "",
      derivation: "m/44'/145'/0'",
    });

    Log.info("Wallet restored successfully:", restoredHash);
    return { isSuccess: true, walletHash: restoredHash };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    Log.error("Restore failed:", error);
    return { isSuccess: false, error };
  }
}
