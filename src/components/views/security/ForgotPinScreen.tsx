/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { selectPreferences } from "@/redux/preferences";

import ConsoleService from "@/kernel/app/ConsoleService";
import JanitorService from "@/kernel/app/JanitorService";
import ModalService from "@/kernel/app/ModalService";
import SecurityService from "@/kernel/app/SecurityService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import {
  confirmButtonProps,
  dangerButtonProps,
} from "@/composite/modals/modalButtonStyles";

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
  labelSize: "md" as const,
} as const;

export const primaryButtonProps = {
  ...confirmButtonProps,
  ...lockScreenButtonProps,
} as const;

const lockScreenDangerButtonProps = {
  ...dangerButtonProps,
  ...lockScreenButtonProps,
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
            className="flex items-center gap-1 text-neutral-800 dark:text-neutral-200"
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

    const isConfirmed = await ModalService().showConfirm({
      title: translate(translations.resetEverything),
      message: translate(translations.deleteWarning),
      isDanger: true,
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
      <div className="flex items-center gap-2 p-2 mb-2 justify-center">
        <WarningOutlined className="text-error text-2xl" />
        <h2 className="text-2xl font-bold text-error dark:text-error-light">
          {translate(translations.resetEverything)}
        </h2>
      </div>

      <div className="bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded p-3 mb-4">
        <p className="text-error dark:text-error-light mb-2">
          {translate(translations.deleteWarning)}
        </p>
        <ul className="text-error dark:text-error-light list-disc list-inside">
          <li>{translate(translations.allWalletDatabases)}</li>
          <li>{translate(translations.allEncryptionKeys)}</li>
          <li>{translate(translations.allAppSettings)}</li>
          <li>{translate(translations.allTransactionHistory)}</li>
        </ul>
        <p className="text-error dark:text-error-light mt-2 font-semibold">
          {translate(translations.seedPhraseWarning)}
        </p>
      </div>

      <Button
        {...lockScreenDangerButtonProps}
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
    const isConfirmed = await ModalService().showConfirm({
      title: translate(translations.wipeAfterReveal),
      message: translate(translations.wipeConfirmMessage),
      isDanger: true,
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
        <p className="text-center text-neutral-800 dark:text-neutral-200">
          {translate(translations.noWalletFound)}
        </p>
      </LockScreenWrapper>
    );
  }

  return (
    <LockScreenWrapper showBack>
      <div className="flex items-center gap-2 mb-4">
        <WarningOutlined className="text-error text-2xl mr-1" />
        <h2 className="text-2xl font-bold text-error dark:text-error-light">
          {translate(translations.emergencyRevealTitle)}
        </h2>
      </div>

      <div className="bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded p-3 mb-4">
        <p className="text-error dark:text-error-light">
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
        <label className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 mb-3">
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(e) => setHasConfirmed(e.target.checked)}
            disabled={!isAllViewed}
          />
          {translate(translations.confirmWrittenDown)}
        </label>

        <Button
          {...lockScreenDangerButtonProps}
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
  labelSize: "md" as const,
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
      <div className="flex flex-col items-center">
        <SeleneLogo className="w-32 h-32" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {translate(translations.forgotPinTitle)}
        </h1>
        <p className="text-neutral-800 dark:text-neutral-200 text-center mt-2 mb-4">
          {translate(translations.chooseRecovery)}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          {...menuButtonProps}
          onClick={() => navigate("/forgot-pin/wipe")}
          icon={DeleteOutlined}
          iconClasses="text-error mr-2"
          iconSize="2xl"
          label={
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(translations.resetEverything)}
              </div>
              <div className="text-neutral-700 dark:text-neutral-300">
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
            iconClasses="text-warn mr-2"
            iconSize="2xl"
            label={
              <div className="text-left">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {translate(translations.revealRecoveryPhrase)}
                </div>
                <div className="text-neutral-700 dark:text-neutral-300">
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
          iconClasses="text-neutral-400 mr-2"
          iconSize="2xl"
          label={
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(translations.exportDiagnosticLogs)}
              </div>
              <div className="text-neutral-700 dark:text-neutral-300">
                {translate(translations.exportLogsDescription)}
              </div>
            </div>
          }
        />
      </div>
    </LockScreenWrapper>
  );
}
