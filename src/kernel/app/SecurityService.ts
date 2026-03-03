import { Dialog } from "@capacitor/dialog";
import { SimpleEncryption } from "capacitor-plugin-simple-encryption";
import LogService from "@/kernel/app/LogService";
import NotificationService from "@/kernel/app/NotificationService";
import { store } from "@/redux";
import { selectSecuritySettings } from "@/redux/preferences";
import { setIsLocked } from "@/redux/device";
import { sha256 } from "@/util/hash";
import { translate } from "@/util/translations";
import common from "@/translations/common";
import securityTranslations from "@/views/security/translations";
import DatabaseService, {
  DecryptionFailedError,
} from "@/kernel/app/DatabaseService";
import { clearSeedCache } from "@/kernel/wallet/KeyManagerService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

const Log = LogService("SecurityService");

let isReady = false;
let hasPinConfigured = false;

export interface ImportKeyBackupResult {
  isSuccess: boolean;
  isKeyMismatch: boolean;
  failedFiles: string[];
}

export enum AuthActions {
  Any = "Any",
  Debug = "Debug",
  AppOpen = "AppOpen",
  AppResume = "AppResume",
  WalletActivate = "WalletActivate",
  SendTransaction = "SendTransaction",
  InstantPay = "InstantPay",
  RevealBalance = "RevealBalance",
  RevealPrivateKeys = "RevealPrivateKeys",
}

const authTextKeys: Record<AuthActions, Record<string, string> | null> = {
  [AuthActions.Any]: null,
  [AuthActions.Debug]: { en: "Debug" },
  [AuthActions.AppOpen]: common.authOpenApp,
  [AuthActions.AppResume]: common.authResumeApp,
  [AuthActions.WalletActivate]: common.authActivateWallet,
  [AuthActions.SendTransaction]: common.authSendTransaction,
  [AuthActions.InstantPay]: common.authInstantPay,
  [AuthActions.RevealBalance]: common.authRevealBalances,
  [AuthActions.RevealPrivateKeys]: common.authRevealPrivateKeys,
};

function getAuthText(action: AuthActions): string {
  const key = authTextKeys[action];
  return key ? translate(key) : "";
}

export default function SecurityService() {
  return {
    authorize,
    authorizeBio,
    authorizeLegacyPin,
    isEncryptionReady,
    isPinConfigured,
    setPinConfigured,
    initEncryption,
    lock,
    unlock,
    // PIN management (state-coupled: setPinConfigured must follow)
    verifyPin,
    setPin,
    removePin,
    // Biometric (composite operations)
    hasBiometricKey,
    unlockWithBiometric,
    verifyBiometric,
    storeBiometricKeyFromCurrent,
    // Composite operations (extracted from SecuritySettings)
    changePinAndUpdateBiometric,
    exportKeyBackup,
    importKeyBackup,
    setDeviceOnlyMode,
    allWalletsSeedViewed,
    // Reset (state-coupled: must clear all auth state)
    resetEncryption,
  };

  // Initialize encryption and cache the result in module state.
  // Called from init.jsx (no pin) and from AppLockScreen (with pin).
  async function initEncryption(pin?: string): Promise<boolean> {
    const { isReady: isNowReady, hasPinConfigured: hasPin } =
      await DatabaseService().initEncryption(pin);
    isReady = isNowReady;
    hasPinConfigured = hasPin;
    return isNowReady;
  }

  function isEncryptionReady(): boolean {
    return isReady;
  }

  function isPinConfigured(): boolean {
    return hasPinConfigured;
  }

  function unlock(): void {
    store.dispatch(setIsLocked(false));
  }

  function setPinConfigured(value: boolean): void {
    hasPinConfigured = value;
  }

  // Lock: flush databases, close all handles, clear native key, mark not ready.
  // The Redux lock flag is set first so the lock screen shows immediately.
  async function lock(): Promise<void> {
    store.dispatch(setIsLocked(true));
    clearSeedCache();
    await DatabaseService().closeAllDatabases();
    await SimpleEncryption.clearKeyFromMemory();
    isReady = false;
  }

  // authorize user according to user preference
  async function authorize(
    action: AuthActions = AuthActions.Any
  ): Promise<boolean> {
    const { authMode, authActions } = selectSecuritySettings(store.getState());

    const isAuthRequired =
      action === AuthActions.Any || authActions.includes(action);

    if (!isAuthRequired) {
      return true;
    }

    let isAuthorized = false;
    switch (authMode) {
      case "bio":
        isAuthorized = await authorizeBio(action);
        break;

      case "pin":
        isAuthorized = await authorizePin(action);
        break;

      case "none":
        isAuthorized = true;
        break;

      default:
        isAuthorized = false;
        break;
    }

    if (!isAuthorized) {
      NotificationService().authFail(getAuthText(action));
    }

    return isAuthorized;
  }

  async function authorizeBio(
    action: AuthActions = AuthActions.Any
  ): Promise<boolean> {
    try {
      await verifyBiometric(getAuthText(action));
      return true;
    } catch (e) {
      Log.warn("Biometric auth failed:", e);
      return false;
    }
  }

  async function authorizePin(action: AuthActions = AuthActions.Any) {
    if (!isPinConfigured()) {
      return true;
    }

    const { value: pin } = await Dialog.prompt({
      title: getAuthText(action) || translate(common.enterPin),
      message: translate(common.pleaseEnterYourPin),
      okButtonTitle: `${translate(common.authorizeAction)} ${getAuthText(action)}`,
    });

    if (!pin) {
      return false;
    }

    return verifyPin(pin);
  }

  // Remove after 99% of userbase is verified to have version 2026.03+
  async function authorizeLegacyPin(pinHash: string): Promise<string> {
    const result = await Dialog.prompt({
      title: translate(securityTranslations.securityUpgrade),
      message: translate(securityTranslations.enterPinToUpgrade),
      okButtonTitle: translate(securityTranslations.upgrade),
    });

    if (result.value && sha256.text(result.value) === pinHash) {
      return result.value;
    }

    return authorizeLegacyPin(pinHash);
  }

  // --- PIN management  ---

  /**
   * Verify a PIN against the encryption plugin.
   * Handles lockout errors with toast notification; never throws.
   * Returns true if valid, false if invalid or locked out.
   */
  async function verifyPin(pin: string): Promise<boolean> {
    try {
      const { isValid } = await SimpleEncryption.verifyPin({ pin });
      if (!isValid) {
        NotificationService().error(translate(common.incorrectPin));
      }
      return isValid;
    } catch (e) {
      // Lockout error (native) — show remaining time
      NotificationService().error(translate(common.locked), String(e));
      return false;
    }
  }

  /** Set or change PIN. Key must already be loaded. Automatically updates pinConfigured state. */
  async function setPin(newPin: string): Promise<void> {
    await SimpleEncryption.setPin({ newPin });
    setPinConfigured(true);
  }

  /** Remove PIN. Key must already be loaded. Automatically updates pinConfigured state. */
  async function removePin(): Promise<void> {
    await SimpleEncryption.removePin();
    setPinConfigured(false);
  }

  // --- Biometric  ---

  /** Check if a biometric key exists in platform storage. */
  async function hasBiometricKey(): Promise<boolean> {
    const { value: hasBioKey } = await SimpleEncryption.hasBiometricKey();
    return hasBioKey;
  }

  /**
   * Full biometric unlock: load biometric key + load into plugin memory.
   * Keeps raw key out of UI code.
   */
  async function unlockWithBiometric(): Promise<void> {
    const { key } = await SimpleEncryption.loadBiometricKey({
      title: "Selene Wallet",
      reason: translate(common.authorizeThisAction),
    });
    await SimpleEncryption.loadKeyIntoMemory({ key });
  }

  /**
   * Re-auth biometric: verify biometric presence without key material.
   */
  async function verifyBiometric(reason?: string): Promise<void> {
    await SimpleEncryption.verifyBiometric({
      title: "Selene Wallet",
      reason,
    });
  }

  /** Export current encryption key and store in biometric-protected storage. */
  async function storeBiometricKeyFromCurrent(): Promise<void> {
    const { key } = await SimpleEncryption.exportCurrentKey();
    await SimpleEncryption.storeBiometricKey({ key });
  }

  /** Set or change PIN and update biometric key if available. Key must already be loaded. */
  async function changePinAndUpdateBiometric(
    newPin: string,
    hasBiometric?: boolean
  ): Promise<void> {
    await setPin(newPin);

    if (hasBiometric) {
      try {
        await storeBiometricKeyFromCurrent();
      } catch (bioErr) {
        Log.warn("Failed to store biometric key:", bioErr);
      }
    }
  }

  /** Export encryption key backup protected by a password. */
  async function exportKeyBackup(password: string): Promise<string> {
    const { data } = await SimpleEncryption.exportKeyBackup({ password });
    return data;
  }

  /**
   * Import an encryption key backup: save marker, import key, verify,
   * rollback on mismatch, update biometric key, re-encrypt all data.
   */
  async function importKeyBackup(
    data: string,
    password: string
  ): Promise<ImportKeyBackupResult> {
    const Database = DatabaseService();

    // Save old key as progress marker BEFORE import — if we crash after
    // importKeyBackup but before re-encryption, this marker lets us recover
    const { key: oldKeyBase64 } = await SimpleEncryption.exportCurrentKey();
    await Database.saveReencryptionMarker(oldKeyBase64);

    // Import new key (replaces in-memory + persistent key)
    await SimpleEncryption.importKeyBackup({ data, password });

    // Verify the imported key can decrypt existing databases
    try {
      await Database.testDecryptAppDb();
    } catch (verifyErr) {
      if (verifyErr instanceof DecryptionFailedError) {
        // Roll back: restore old key and clean up marker
        await SimpleEncryption.replaceKey({ key: oldKeyBase64 });
        await Database.clearReencryptionMarker();
        return { isSuccess: false, isKeyMismatch: true, failedFiles: [] };
      }
      // Non-decryption error (file missing etc.) — key might still be valid
    }

    // Update biometric key if available
    try {
      const hasBioKey = await hasBiometricKey();
      if (hasBioKey) {
        await storeBiometricKeyFromCurrent();
      }
    } catch (bioErr) {
      Log.warn("Failed to update biometric key:", bioErr);
    }

    // Re-encrypt all data with new key
    const failedFiles = await Database.reencryptAllData(oldKeyBase64);
    return { isSuccess: true, isKeyMismatch: false, failedFiles };
  }

  /** Set device-only key storage mode in the encryption plugin. */
  async function setDeviceOnlyMode(enabled: boolean): Promise<void> {
    await SimpleEncryption.setKeyStorageSettings({ deviceOnly: enabled });
  }

  /** Check whether all wallets have had their seed phrase viewed. */
  function allWalletsSeedViewed(): boolean {
    const allWallets = WalletManagerService().listWallets();
    return allWallets.every((w) => w.key_viewed_at !== null);
  }

  /** Reset all encryption state in the plugin. */
  async function resetEncryption(): Promise<void> {
    await SimpleEncryption.resetAll();
  }
}
