/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { useNavigate } from "react-router";
import { SimpleEncryption } from "capacitor-plugin-simple-encryption";
import {
  ArrowLeftOutlined,
  ImportOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import SeleneLogo from "@/atoms/SeleneLogo";
import Button from "@/atoms/Button";
import ConsoleService from "@/kernel/app/ConsoleService";
import DatabaseService, {
  DecryptionFailedError,
} from "@/kernel/app/DatabaseService";
import JanitorService from "@/kernel/app/JanitorService";
import LogService from "@/kernel/app/LogService";
import { translate } from "@/util/translations";
import translations from "./translations";

const Log = LogService("ForgotPinScreen");

function restartApp() {
  window.location.assign("/");
}

const lockScreenButtonProps = {
  fullWidth: true,
  borderClasses: "",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

export const primaryButtonProps = {
  ...lockScreenButtonProps,
  bgColor: "bg-primary-600 hover:bg-primary-700",
  activeBgColor: "bg-primary-700",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
} as const;

export const dangerButtonProps = {
  ...lockScreenButtonProps,
  bgColor: "bg-red-600 hover:bg-red-700",
  activeBgColor: "bg-red-700",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
} as const;

// Centered card layout for the lock screen flow.
// Used by both AppLockScreen and ForgotPinScreen (pre-auth, outside router context).
export function LockScreenWrapper({
  children,
  showBack = false,
}: {
  children: React.ReactNode;
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-neutral-500 mb-4"
          >
            <ArrowLeftOutlined /> {translate(translations.back)}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  if (!error) {
    return null;
  }
  return (
    <div className="mb-3 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-center text-sm">
      {error}
    </div>
  );
}

export function ImportBackupScreen() {
  const [backupData, setBackupData] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImportBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupData || !password || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Calls plugin directly (bypassing SecurityService) because this screen
      // operates pre-auth when no encryption key is loaded.
      await SimpleEncryption.importKeyBackup({ data: backupData, password });
      setPassword("");
      setBackupData("");
      Log.log("Key backup imported successfully from forgot PIN screen");

      // Verify the imported key can decrypt existing databases
      try {
        await DatabaseService().testDecryptAppDb();
      } catch (verifyErr) {
        if (verifyErr instanceof DecryptionFailedError) {
          Log.error("Imported key does not match databases", verifyErr);
          setError(translate(translations.keyMismatch));
          setIsLoading(false);
          return;
        }
        // Non-decryption error (file missing etc.) — key might still be valid
        Log.warn("Could not verify key against app.db", verifyErr);
      }

      // Restart the app to re-initialize with the new key
      restartApp();
    } catch (err) {
      Log.error("Key import failed", err);
      setError(
        err instanceof Error
          ? err.message
          : translate(translations.importFailed)
      );
      setIsLoading(false);
    }
  };

  return (
    <LockScreenWrapper showBack>
      <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        {translate(translations.importKeyBackup)}
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {translate(translations.importKeyBackupInfo)}
      </p>

      <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded text-sm text-amber-700 dark:text-amber-300">
        <WarningOutlined className="mr-1" />
        {translate(translations.importWarning)}
      </div>

      <form onSubmit={handleImportBackup}>
        <textarea
          value={backupData}
          onChange={(e) => setBackupData(e.target.value)}
          placeholder={translate(translations.pasteBackupData)}
          className="w-full p-3 mb-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm h-24 resize-none"
          disabled={isLoading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={translate(translations.backupPassword)}
          className="w-full p-3 mb-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          disabled={isLoading}
        />

        <ErrorMessage error={error} />

        <Button
          submit
          {...primaryButtonProps}
          label={
            isLoading
              ? translate(translations.importing)
              : translate(translations.importAndRestart)
          }
          disabled={!backupData || !password || isLoading}
        />
      </form>
    </LockScreenWrapper>
  );
}

export function NuclearWipeScreen() {
  const [wipeConfirmText, setWipeConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNuclearWipe = async () => {
    if (wipeConfirmText !== translate(translations.deleteAllData) || isLoading)
      return;

    setIsLoading(true);
    await JanitorService().nuclearWipe();
    restartApp();
  };

  return (
    <LockScreenWrapper showBack>
      <div className="flex items-center gap-2 mb-4">
        <WarningOutlined className="text-red-500 text-xl" />
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
          {translate(translations.resetEverything)}
        </h2>
      </div>

      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
          {translate(translations.deleteWarning)}
        </p>
        <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
          <li>{translate(translations.allWalletDatabases)}</li>
          <li>{translate(translations.allEncryptionKeys)}</li>
          <li>{translate(translations.allAppSettings)}</li>
          <li>{translate(translations.allTransactionHistory)}</li>
        </ul>
        <p className="text-sm text-red-700 dark:text-red-300 mt-2 font-semibold">
          {translate(translations.seedPhraseWarning)}
        </p>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
        {translate(translations.typeToConfirm)}{" "}
        <span className="font-mono font-bold">
          {translate(translations.deleteAllData)}
        </span>
      </p>
      <input
        type="text"
        value={wipeConfirmText}
        onChange={(e) => setWipeConfirmText(e.target.value)}
        placeholder={translate(translations.deleteAllData)}
        className="w-full p-3 mb-3 border border-red-300 dark:border-red-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center font-mono"
        disabled={isLoading}
      />

      <Button
        {...dangerButtonProps}
        label={
          isLoading
            ? translate(translations.wiping)
            : translate(translations.resetEverything)
        }
        onClick={handleNuclearWipe}
        disabled={
          wipeConfirmText !== translate(translations.deleteAllData) || isLoading
        }
      />
    </LockScreenWrapper>
  );
}

const menuButtonProps = {
  fullWidth: true,
  justify: "start" as const,
  bgColor: "bg-neutral-50 dark:bg-neutral-700",
  activeBgColor: "bg-neutral-100 dark:bg-neutral-600",
  labelColor: "",
  activeLabelColor: "",
  borderClasses: "border border-neutral-200 dark:border-neutral-600",
  rounded: "lg" as const,
  shadow: "none" as const,
} as const;

export function ForgotPinMenu() {
  const navigate = useNavigate();

  return (
    <LockScreenWrapper showBack>
      <div className="flex flex-col items-center mb-6">
        <SeleneLogo className="w-12 h-12 mb-3" />
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {translate(translations.forgotPinTitle)}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2">
          {translate(translations.chooseRecovery)}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          {...menuButtonProps}
          onClick={() => navigate("/forgot-pin/import")}
          icon={ImportOutlined}
          iconClasses="text-primary-500"
          iconSize="lg"
          label={
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(translations.importKeyBackup)}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {translate(translations.restoreFromBackup)}
              </div>
            </div>
          }
        />

        <Button
          {...menuButtonProps}
          onClick={() => navigate("/forgot-pin/wipe")}
          icon={DeleteOutlined}
          iconClasses="text-red-500"
          iconSize="lg"
          label={
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(translations.resetEverything)}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {translate(translations.wipeDescription)}
              </div>
            </div>
          }
        />

        <Button
          {...menuButtonProps}
          onClick={() => ConsoleService().exportLogs()}
          icon={FileTextOutlined}
          iconClasses="text-neutral-500"
          iconSize="lg"
          label={
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(translations.exportDiagnosticLogs)}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {translate(translations.exportLogsDescription)}
              </div>
            </div>
          }
        />
      </div>
    </LockScreenWrapper>
  );
}
