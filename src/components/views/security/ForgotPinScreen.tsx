/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import JanitorService from "@/kernel/app/JanitorService";
import ModalService from "@/kernel/app/ModalService";
import SecurityService from "@/kernel/app/SecurityService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";
import ShowMnemonic from "@/atoms/ShowMnemonic";
import {
  confirmButtonProps,
  dangerButtonProps,
} from "@/composite/modals/modalButtonStyles";

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
      <FullColumn className="bg-neutral-100 dark:bg-neutral-900">
        <ViewHeader
          title={translate(translations.emergencyRevealTitle)}
          back={-1}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-center text-neutral-800 dark:text-neutral-200">
            {translate(translations.noWalletFound)}
          </p>
        </div>
      </FullColumn>
    );
  }

  return (
    <FullColumn className="bg-neutral-100 dark:bg-neutral-900">
      <ViewHeader
        title={translate(translations.emergencyRevealTitle)}
        icon={WarningOutlined}
        back={-1}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-error-light/20 dark:bg-error-dark/30 border border-error-light dark:border-error-dark rounded p-3 mb-4">
          <p className="text-error dark:text-error-light">
            {translate(translations.emergencyRevealWarning)}
          </p>
        </div>

        {wallets.map((w) => (
          <div key={w.walletHash}>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-4 mb-2">
              {w.name}
            </h3>
            <ShowMnemonic
              walletHash={w.walletHash}
              onReveal={handleRevealCheck}
              disableLongPress
            />
          </div>
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
      </div>
    </FullColumn>
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
  const [hasSecurityQuestion, setHasSecurityQuestion] = useState(false);
  useEffect(function checkSecurityQuestion() {
    SecurityService().hasSecurityQuestion().then(setHasSecurityQuestion);
  }, []);
  return (
    <FullColumn className="bg-neutral-100 dark:bg-neutral-900">
      <ViewHeader title={translate(translations.forgotPinTitle)} back={-1} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center mb-4">
          <SeleneLogo className="w-24 h-24" />
          <p className="text-neutral-800 dark:text-neutral-200 text-center mt-2">
            {translate(translations.chooseRecovery)}
          </p>
        </div>

        <div className="space-y-3">
          {hasSecurityQuestion ? (
            <Button
              {...menuButtonProps}
              onClick={() => navigate("/forgot-pin/security-question")}
              icon={QuestionCircleOutlined}
              iconClasses="text-primary-500 mr-2"
              iconSize="2xl"
              label={
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {translate(translations.answerSecurityQuestion)}
                  </div>
                  <div className="text-neutral-700 dark:text-neutral-300">
                    {translate(translations.answerSecurityQuestionDescription)}
                  </div>
                </div>
              }
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <InfoCircleOutlined className="text-4xl text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400 text-center">
                {translate(translations.noRecoveryAvailable)}
              </p>
            </div>
          )}
        </div>
      </div>
    </FullColumn>
  );
}
