import { Preferences } from "@capacitor/preferences";
import { SimpleEncryption } from "capacitor-plugin-simple-encryption";

import { store } from "@/redux";
import { setIsLocked } from "@/redux/device";
import { selectSecuritySettings } from "@/redux/preferences";

import DatabaseService, {
  DecryptionFailedError,
} from "@/kernel/app/DatabaseService";
import LogService from "@/kernel/app/LogService";
import ModalService from "@/kernel/app/ModalService";
import NotificationService from "@/kernel/app/NotificationService";
import { clearSeedCache } from "@/kernel/wallet/KeyManagerService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import securityTranslations from "@/views/security/translations";

import { sha256 } from "@/util/hash";

import common from "@/translations/common";
import { translate } from "@/util/translations";

import {
  decryptWithAnswer,
  getBackoffMs,
  getRemainingLockoutSeconds,
  isLockedOut,
  type SecurityQuestionData,
} from "@/kernel/backup/SecurityQuestionEncryption";

const Log = LogService("SecurityService");
const MIN_PASSWORD_LENGTH = 8;
const MIN_PIN_LENGTH = 4;
export const SECURITY_QUESTION_PREF_KEY = "securityQuestionRecovery";

let hasPinConfigured = false;
/** Tracks whether the user clicked the "Forgot PIN" button */
let didClickForgotPin = false;

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
  [AuthActions.Debug]: common.debug,
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
    isPinConfigured,
    setPinConfigured,
    initEncryption,
    lock,
    unlock,
    securePause,
    // PIN management (state-coupled: setPinConfigured must follow)
    verifyPin,
    setPin,
    removePin,
    // Biometric (composite operations)
    hasBiometricKey,
    removeBiometricKey,
    unlockWithBiometric,
    verifyBiometric,
    storeBiometricKeyFromCurrent,
    promptBiometricPermission,
    // Composite operations
    promptForNewPin,
    changePinAndUpdateBiometric,
    exportKeyBackup,
    importKeyBackup,
    setDeviceOnlyMode,
    allWalletsSeedViewed,
    // Security question recovery
    getSecurityQuestionData,
    setSecurityQuestionData,
    clearSecurityQuestionData,
    hasSecurityQuestion,
    getMnemonicForRecovery,
    // Reset (state-coupled: must clear all auth state)
    resetEncryption,
  };

  // Initialize encryption and cache the result in module state.
  // Called from init.jsx (no pin) and from AppLockScreen (with pin).
  async function initEncryption(pin?: string): Promise<boolean> {
    const { isReady: isKeyLoaded, hasPinConfigured: hasPin } =
      await DatabaseService().initEncryption(pin);
    hasPinConfigured = hasPin;
    return isKeyLoaded;
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

  // Lock: flush databases, close all handles, clear native key.
  // The Redux lock flag is set first so the lock screen shows immediately.
  async function lock(): Promise<void> {
    store.dispatch(setIsLocked(true));
    clearSeedCache();
    await DatabaseService().closeAllDatabases();
    await SimpleEncryption.clearKeyFromMemory();
  }

  // Clear sensitive material without dispatching Redux state.
  // Called by AppProvider on pause — phase transition handles UI, not Redux.
  async function securePause(): Promise<void> {
    clearSeedCache();
    await DatabaseService().closeAllDatabases();
    await SimpleEncryption.clearKeyFromMemory();
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
      case "password":
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

    const { isNumericPin } = selectSecuritySettings(store.getState());
    const isPasswordMode = !isNumericPin;

    // Check if security question recovery is available
    const hasRecovery = await hasSecurityQuestion();
    didClickForgotPin = false;

    const promptOptions: {
      title: string;
      inputType: "password";
      inputMode: "text" | "numeric";
      submitLabel: string;
      cancelLabel?: string;
      cancelButtonClick?: () => void;
    } = {
      title: translate(
        isPasswordMode ? common.enterPassword : common.enterPin
      ),
      inputType: "password",
      inputMode: isPasswordMode ? "text" : "numeric",
      submitLabel: translate(common.authorizeAction),
    };

    if (hasRecovery) {
      promptOptions.cancelLabel = translate(securityTranslations.forgotPin);
      promptOptions.cancelButtonClick = () => {
        didClickForgotPin = true;
      };
    }

    const pin = await ModalService().showPrompt(promptOptions);

    if (!pin) {
      if (didClickForgotPin) {
        didClickForgotPin = false;
        return handleForgotPinRecovery(true /* skipConfirm */);
      }
      return false;
    }

    return verifyPin(pin);
  }

  /**
   * Handle "Forgot PIN" flow: prompt for security question answer,
   * decrypt to verify. Returns true if correct (auth granted),
   * false if cancelled, wrong answer, or locked out.
   */
  async function handleForgotPinRecovery(
    skipConfirm = false
  ): Promise<boolean> {
    const questionData = await getSecurityQuestionData();
    if (!questionData) return false;

    // Check if currently locked out
    if (questionData.lockedUntil && isLockedOut(questionData.lockedUntil)) {
      const remaining = getRemainingLockoutSeconds(questionData.lockedUntil);
      NotificationService().error(
        translate(securityTranslations.tooManyAttempts, {
          seconds: String(remaining),
        })
      );
      return false;
    }

    if (!skipConfirm) {
      const wantsRecovery = await ModalService().showConfirm({
        title: translate(securityTranslations.forgotPin),
        message: translate(securityTranslations.recoverWithSecurityQuestion),
        confirmLabel: translate(securityTranslations.recover),
        cancelLabel: translate(common.cancel),
      });
      if (!wantsRecovery) return false;
    }

    const answer = await ModalService().showPrompt({
      title: questionData.question,
      inputType: "password",
      submitLabel: translate(common.authorizeAction),
      cancelLabel: translate(common.cancel),
    });
    if (!answer) return false;

    try {
      await decryptWithAnswer(questionData.blob, answer);

      // Reset attempts on success
      questionData.failedAttempts = 0;
      questionData.lockedUntil = null;
      await setSecurityQuestionData(questionData);

      return true;
    } catch {
      // GCM auth tag mismatch — wrong answer
      const newAttempts = questionData.failedAttempts + 1;
      const backoffMs = getBackoffMs(newAttempts);
      const lockedUntil = new Date(Date.now() + backoffMs).toISOString();

      questionData.failedAttempts = newAttempts;
      questionData.lockedUntil = lockedUntil;
      await setSecurityQuestionData(questionData);

      if (backoffMs > 0) {
        const remaining = getRemainingLockoutSeconds(lockedUntil);
        NotificationService().error(
          translate(securityTranslations.tooManyAttempts, {
            seconds: String(remaining),
          })
        );
      } else {
        NotificationService().error(
          translate(securityTranslations.wrongAnswer)
        );
      }
    }

    return false;
  }

  // Remove after 99% of userbase is verified to have version 2026.03+
  async function authorizeLegacyPin(pinHash: string): Promise<string | null> {
    /* eslint-disable no-constant-condition, no-await-in-loop */
    while (true) {
      const pin = await ModalService().showPrompt({
        title: translate(securityTranslations.securityUpgrade),
        message: translate(securityTranslations.enterPinOrPasswordToUpgrade),
        inputType: "password",
        inputMode: "text",
        submitLabel: translate(securityTranslations.upgrade),
      });

      // User dismissed the modal — return to lock screen
      if (!pin) {
        return null;
      }

      if (sha256.text(pin) === pinHash) {
        return pin;
      }

      NotificationService().error(translate(common.incorrectPin));
    }
    /* eslint-enable no-constant-condition, no-await-in-loop */
  }

  // --------------------------------

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

  /** Prompt user to enter and confirm a new PIN or password. Returns null if cancelled.
   *  isPasswordMode: true=text keyboard, false=numeric, undefined=read from prefs */
  async function promptForNewPin(
    isPasswordOverride?: boolean
  ): Promise<string | null> {
    const { isNumericPin } = selectSecuritySettings(store.getState());
    const isPasswordMode =
      isPasswordOverride !== undefined ? isPasswordOverride : !isNumericPin;
    const Modal = ModalService();

    const pin = await Modal.showPrompt({
      title: isPasswordMode
        ? translate(common.enterNewPassword)
        : translate(common.enterNewPin),
      message: isPasswordMode ? translate(common.minimumCharacters) : undefined,
      inputType: "password",
      inputMode: isPasswordMode ? "text" : "numeric",
      placeholder: isPasswordMode
        ? translate(common.enterPassword)
        : translate(common.enterPin),
      submitLabel: translate(common.next),
      pattern: isPasswordMode ? undefined : "[0-9]*",
    });

    if (!pin) return null;

    if (isPasswordMode && pin.length < MIN_PASSWORD_LENGTH) {
      NotificationService().error(translate(common.passwordMinLength));
      return null;
    }

    if (!isPasswordMode && pin.length < MIN_PIN_LENGTH) {
      NotificationService().error(translate(common.pinMinLength));
      return null;
    }

    const confirmPin = await Modal.showPrompt({
      title: isPasswordMode
        ? translate(common.confirmPassword)
        : translate(common.confirmPin),
      inputType: "password",
      inputMode: isPasswordMode ? "text" : "numeric",
      placeholder: isPasswordMode
        ? translate(common.enterPassword)
        : translate(common.enterPin),
      submitLabel: translate(common.confirm),
      pattern: isPasswordMode ? undefined : "[0-9]*",
    });

    if (!confirmPin) return null;

    if (pin !== confirmPin) {
      NotificationService().error(translate(common.valuesDoNotMatch));
      return null;
    }

    return pin;
  }

  // --------------------------------

  /** Check if a biometric key exists in platform storage. */
  async function hasBiometricKey(): Promise<boolean> {
    const { value: hasBioKey } = await SimpleEncryption.hasBiometricKey();
    return hasBioKey;
  }

  /** Remove biometric key from platform storage. No-op if none exists. */
  async function removeBiometricKey(): Promise<void> {
    await SimpleEncryption.removeBiometricKey();
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

  /** Prompt user to open app settings when biometric permission is denied. */
  async function promptBiometricPermission(): Promise<void> {
    const shouldOpen = await ModalService().showConfirm({
      title: translate(securityTranslations.biometricPermissionRequired),
      message: translate(securityTranslations.biometricNotEnabled),
      confirmLabel: translate(securityTranslations.openSettings),
    });
    if (shouldOpen) {
      await SimpleEncryption.openAppSettings();
    }
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

  // --------------------------------
  // Security Question Recovery
  // --------------------------------

  /**
   * Read the stored security question data from Capacitor Preferences.
   * Returns null if none exists.
   */
  async function getSecurityQuestionData(): Promise<SecurityQuestionData | null> {
    try {
      const { value } = await Preferences.get({
        key: SECURITY_QUESTION_PREF_KEY,
      });
      if (!value) return null;
      return JSON.parse(value) as SecurityQuestionData;
    } catch (e) {
      Log.warn("Failed to read security question data:", e);
      return null;
    }
  }

  /**
   * Save security question data to Capacitor Preferences.
   */
  async function setSecurityQuestionData(
    data: SecurityQuestionData
  ): Promise<void> {
    await Preferences.set({
      key: SECURITY_QUESTION_PREF_KEY,
      value: JSON.stringify(data),
    });
  }

  /**
   * Remove security question data from Capacitor Preferences.
   */
  async function clearSecurityQuestionData(): Promise<void> {
    await Preferences.remove({ key: SECURITY_QUESTION_PREF_KEY });
  }

  /**
   * Check if a security question has been configured.
   */
  async function hasSecurityQuestion(): Promise<boolean> {
    const data = await getSecurityQuestionData();
    return data !== null;
  }

  /**
   * Get the mnemonic of the currently active wallet for recovery encryption.
   * Requires database to be open — call only during setup (not during recovery).
   */
  function getMnemonicForRecovery(): string {
    const WalletManager = WalletManagerService();
    const state = store.getState();
    const walletHash = state.wallet.walletHash;
    if (!walletHash) {
      throw new Error("No active wallet found");
    }
    const wallet = WalletManager.getWallet(walletHash);
    if (!wallet.mnemonic) {
      throw new Error("No mnemonic found for active wallet");
    }
    return wallet.mnemonic;
  }

  /** Reset all encryption state in the plugin. */
  async function resetEncryption(): Promise<void> {
    await SimpleEncryption.resetAll();
    hasPinConfigured = false;
  }
}
