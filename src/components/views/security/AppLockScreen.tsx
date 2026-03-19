import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";

import { selectDeviceInfo } from "@/redux/device";
import { selectSecuritySettings } from "@/redux/preferences";

import LogService from "@/kernel/app/LogService";
import { ModalProvider } from "@/kernel/app/ModalService";
import SecurityService from "@/kernel/app/SecurityService";

import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";

import { translate } from "@/util/translations";
import translations from "./translations";

import {
  ForgotPinMenu,
  LegacyRevealScreen,
  LockScreenWrapper,
  NuclearWipeScreen,
  primaryButtonProps,
} from "./ForgotPinScreen";

const Security = SecurityService();

const Log = LogService("AppLockScreen");

interface AppLockScreenProps {
  boot: () => Promise<void>;
}

function LockScreen({ boot }: AppLockScreenProps) {
  const navigate = useNavigate();
  const { authMode } = useSelector(selectSecuritySettings);
  const { hasBiometric } = useSelector(selectDeviceInfo);
  const isPinConfigured = Security.isPinConfigured();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordMode = authMode === "password";
  const shouldShowPin =
    isPinConfigured || authMode === "pin" || authMode === "password";
  const shouldShowBio = authMode === "bio" && hasBiometric;

  // ----------------
  const tryBiometric = useCallback(
    async function tryBiometric() {
      try {
        setIsLoading(true);
        const hasBioKey = await Security.hasBiometricKey();

        if (hasBioKey) {
          await Security.unlockWithBiometric();
        } else {
          // Migration: key in memory, store with bio protection
          await Security.storeBiometricKeyFromCurrent();
        }

        await boot();
        return true;
      } catch (e) {
        Log.debug("Biometric unlock failed or cancelled", e);
        setIsLoading(false);
        return false;
      }
    },
    [boot]
  );

  // Auto-trigger biometric on mount
  useEffect(
    function attemptBiometricUnlock() {
      if (shouldShowBio) {
        tryBiometric();
      }
    },
    [tryBiometric, shouldShowBio]
  );

  // ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isReady = await Security.initEncryption(pin);
      if (!isReady) {
        setError(translate(translations.failedToUnlock));
        return;
      }
      Log.log("PIN unlock successful");
      await boot();
    } catch (err) {
      Log.error("PIN unlock failed", err);
      setError(
        err instanceof Error
          ? err.message
          : translate(translations.failedToUnlock)
      );
    } finally {
      setPin("");
      setIsLoading(false);
    }
  };

  // --------------------------------
  return (
    <LockScreenWrapper>
      <div className="flex flex-col items-center">
        <SeleneLogo className="w-32 h-32" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Selene Wallet
        </h1>
      </div>

      {shouldShowPin && (
        <form onSubmit={handleSubmit} className="p-2 my-4 flex flex-col gap-2">
          <input
            type="password"
            inputMode={isPasswordMode ? undefined : "numeric"}
            pattern={isPasswordMode ? undefined : "[0-9]*"}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={translate(
              isPasswordMode
                ? translations.enterPassword
                : translations.enterPin
            )}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center text-xl tracking-widest"
            autoFocus
            disabled={isLoading}
          />

          {error && (
            <div className="mb-4 p-2 bg-error-light/20 dark:bg-error-dark/30 text-error dark:text-error-light rounded text-center text-sm">
              {error}
            </div>
          )}

          <Button
            submit
            {...primaryButtonProps}
            label={
              isLoading
                ? translate(translations.unlocking)
                : translate(translations.unlock)
            }
            disabled={isLoading}
          />
        </form>
      )}

      {shouldShowBio && (
        <div className={shouldShowPin ? "mt-3" : ""}>
          <Button
            {...primaryButtonProps}
            bgColor={
              shouldShowPin
                ? "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                : undefined
            }
            activeBgColor={
              shouldShowPin ? "bg-neutral-300 dark:bg-neutral-600" : undefined
            }
            labelColor={
              shouldShowPin
                ? "text-neutral-900 dark:text-neutral-100 font-semibold"
                : undefined
            }
            activeLabelColor={
              shouldShowPin
                ? "text-neutral-900 dark:text-neutral-100"
                : undefined
            }
            label={translate(translations.useBiometric)}
            onClick={tryBiometric}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="mt-4">
        <Button
          label={translate(translations.forgotPin)}
          onClick={() => navigate("/forgot-pin")}
          labelSize="md"
          labelColor="text-primary-500"
          activeLabelColor="text-primary-600"
          bgColor="bg-transparent"
          activeBgColor="bg-transparent"
          borderClasses=""
          shadow="none"
          padding="0"
        />
      </div>

      {shouldShowPin && (
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-center">
          {translate(translations.pinProtectionInfo)}
        </p>
      )}
    </LockScreenWrapper>
  );
}

export default function AppLockScreen({ boot }: AppLockScreenProps) {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<LockScreen boot={boot} />} />
        <Route path="/forgot-pin" element={<ForgotPinMenu />} />
        <Route path="/forgot-pin/reveal" element={<LegacyRevealScreen />} />
        <Route path="/forgot-pin/wipe" element={<NuclearWipeScreen />} />
      </Routes>
      <ModalProvider />
    </MemoryRouter>
  );
}
