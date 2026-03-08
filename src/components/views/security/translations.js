import {
  back,
  enterPin,
  importKeyBackup,
  incorrectPin,
} from "@/translations/common";

const translations = {
  // Imported from common
  back,
  enterPin,
  importKeyBackup,
  incorrectPin,

  // AppLockScreen
  enterPinPrompt: { en: "Enter PIN to unlock your wallet" },
  failedToUnlock: { en: "Failed to unlock encryption" },
  unlocking: { en: "Unlocking..." },
  unlock: { en: "Unlock" },
  forgotPin: { en: "Forgot PIN?" },
  pinProtectionInfo: {
    en: "Your encryption key is protected with a PIN. Enter your PIN to decrypt your wallet data.",
  },
  // ForgotPinScreen
  importKeyBackupInfo: {
    en: "Paste the backup data and enter the password you used when creating the backup.",
  },
  pasteBackupData: { en: "Paste backup data here" },
  backupPassword: { en: "Backup password" },
  importFailed: { en: "Import failed - check your password" },
  importing: { en: "Importing..." },
  importAndRestart: { en: "Import & Restart" },
  resetEverything: { en: "Reset Everything" },
  deleteWarning: { en: "This will delete ALL local data including" },
  allWalletDatabases: { en: "All wallet databases" },
  allEncryptionKeys: { en: "All encryption keys" },
  allAppSettings: { en: "All app settings" },
  allTransactionHistory: { en: "All transaction history" },
  seedPhraseWarning: {
    en: "You will need your seed phrase to recover your wallets.",
  },
  typeToConfirm: { en: "Type DELETE ALL DATA to confirm" },
  deleteAllData: { en: "DELETE ALL DATA" },
  wiping: { en: "Wiping..." },
  forgotPinTitle: { en: "Forgot PIN" },
  chooseRecovery: { en: "Choose a recovery option below." },
  restoreFromBackup: { en: "Restore from a password-protected backup" },
  wipeDescription: {
    en: "Wipe all data and start fresh (requires seed phrase)",
  },
  exportDiagnosticLogs: { en: "Export Diagnostic Logs" },
  exportLogsDescription: { en: "Send logs to support for troubleshooting" },
  keyMismatch: {
    en: "This backup key does not match your existing databases. You can try importing a different backup, or reset everything.",
  },
  importWarning: {
    en: "Importing a backup will replace your current encryption key. This cannot be undone.",
  },
  // LegacyRevealScreen
  emergencyRevealTitle: { en: "Emergency Recovery" },
  emergencyRevealWarning: {
    en: "This will reveal your seed phrase. Write it down on paper immediately. After viewing, this wallet will be permanently wiped and you will need your seed phrase to recover your funds.",
  },
  confirmWrittenDown: { en: "I have written down my seed phrase" },
  wipeAfterReveal: { en: "Wipe Wallet" },
  wipeConfirmMessage: {
    en: "This will permanently delete all wallet data. This cannot be undone.",
  },
  revealRecoveryPhrase: { en: "Reveal Recovery Phrase" },
  revealDescription: {
    en: "View your seed phrase, then wipe the wallet (one-time only)",
  },
  noWalletFound: { en: "No wallet found in database." },
  // Legacy auth migration (JanitorService)
  securityUpgrade: { en: "Security Upgrade" },
  enterPinToUpgrade: {
    en: "Enter your current PIN to complete the security upgrade.",
  },
  upgrade: { en: "Upgrade" },
};

export default translations;
