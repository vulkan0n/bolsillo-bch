/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Dialog } from "@capacitor/dialog";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { selectIsDarkMode, selectPreferences } from "@/redux/preferences";

import ConsoleService from "@/kernel/app/ConsoleService";
import JanitorService from "@/kernel/app/JanitorService";
import SecurityService from "@/kernel/app/SecurityService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";
import ShowMnemonic from "@/atoms/ShowMnemonic";

import { translate } from "@/util/translations";
import translations from "./translations";

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
  bgColor: "bg-primary-500 hover:bg-primary-700",
  activeBgColor: "bg-primary-700",
  labelColor: "text-white font-semibold",
  activeLabelColor: "text-white",
} as const;

export const dangerButtonProps = {
  ...lockScreenButtonProps,
  bgColor: "bg-error hover:bg-error-dark",
  activeBgColor: "bg-error-dark",
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
  const isDarkMode = useSelector(selectIsDarkMode);

  // Apply dark class to <html> for pre-auth screens (MainLayout isn't mounted yet)
  const html = document.documentElement;
  if (isDarkMode) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

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

export function NuclearWipeScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleNuclearWipe = async () => {
    if (isLoading) return;

    const { value: isConfirmed } = await Dialog.confirm({
      title: translate(translations.resetEverything),
      message: translate(translations.deleteWarning),
    });

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await JanitorService().nuclearWipe();
      restartApp();
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <LockScreenWrapper showBack>
      <div className="flex items-center gap-2 mb-4">
        <WarningOutlined className="text-error text-xl" />
        <h2 className="text-lg font-bold text-error dark:text-error-light">
          {translate(translations.resetEverything)}
        </h2>
      </div>

      <div className="bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded p-3 mb-4">
        <p className="text-sm text-error dark:text-error-light mb-2">
          {translate(translations.deleteWarning)}
        </p>
        <ul className="text-sm text-error dark:text-error-light list-disc list-inside">
          <li>{translate(translations.allWalletDatabases)}</li>
          <li>{translate(translations.allEncryptionKeys)}</li>
          <li>{translate(translations.allAppSettings)}</li>
          <li>{translate(translations.allTransactionHistory)}</li>
        </ul>
        <p className="text-sm text-error dark:text-error-light mt-2 font-semibold">
          {translate(translations.seedPhraseWarning)}
        </p>
      </div>

      <Button
        {...dangerButtonProps}
        label={
          isLoading
            ? translate(translations.wiping)
            : translate(translations.resetEverything)
        }
        onClick={handleNuclearWipe}
        disabled={isLoading}
      />
    </LockScreenWrapper>
  );
}

export function LegacyRevealScreen() {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllViewed, setIsAllViewed] = useState(false);

  const wallets = useMemo(() => {
    try {
      return WalletManagerService().listWallets();
    } catch {
      return [];
    }
  }, []);

  const handleRevealCheck = () => {
    setIsAllViewed(SecurityService().allWalletsSeedViewed());
  };

  const handleWipeAfterReveal = async () => {
    const { value: isConfirmed } = await Dialog.confirm({
      title: translate(translations.wipeAfterReveal),
      message: translate(translations.wipeConfirmMessage),
    });
    if (!isConfirmed) {
      return;
    }
    setIsLoading(true);
    await JanitorService().nuclearWipe();
    restartApp();
  };

  if (wallets.length === 0) {
    return (
      <LockScreenWrapper showBack>
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          {translate(translations.noWalletFound)}
        </p>
      </LockScreenWrapper>
    );
  }

  return (
    <LockScreenWrapper showBack>
      <div className="flex items-center gap-2 mb-4">
        <WarningOutlined className="text-error text-xl" />
        <h2 className="text-lg font-bold text-error dark:text-error-light">
          {translate(translations.emergencyRevealTitle)}
        </h2>
      </div>

      <div className="bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded p-3 mb-4">
        <p className="text-sm text-error dark:text-error-light">
          {translate(translations.emergencyRevealWarning)}
        </p>
      </div>

      {wallets.map((w) => (
        <ShowMnemonic
          key={w.walletHash}
          walletHash={w.walletHash}
          onReveal={handleRevealCheck}
        />
      ))}

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(e) => setHasConfirmed(e.target.checked)}
            disabled={!isAllViewed}
          />
          {translate(translations.confirmWrittenDown)}
        </label>

        <Button
          {...dangerButtonProps}
          label={
            isLoading
              ? translate(translations.wiping)
              : translate(translations.wipeAfterReveal)
          }
          onClick={handleWipeAfterReveal}
          disabled={!isAllViewed || !hasConfirmed || isLoading}
        />
      </div>
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
  const { pinHash } = useSelector(selectPreferences);
  const hasLegacyPin = pinHash !== "";

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
          onClick={() => navigate("/forgot-pin/wipe")}
          icon={DeleteOutlined}
          iconClasses="text-error"
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

        {hasLegacyPin && (
          <Button
            {...menuButtonProps}
            onClick={() => navigate("/forgot-pin/reveal")}
            icon={EyeOutlined}
            iconClasses="text-amber-500"
            iconSize="lg"
            label={
              <div className="text-left">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {translate(translations.revealRecoveryPhrase)}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {translate(translations.revealDescription)}
                </div>
              </div>
            }
          />
        )}

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
