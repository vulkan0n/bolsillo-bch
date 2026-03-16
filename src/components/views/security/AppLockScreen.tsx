import { useState, useEffect, useCallback } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { LockOutlined } from "@ant-design/icons";
import { SimpleEncryption } from "capacitor-plugin-simple-encryption";

import { selectSecuritySettings } from "@/redux/preferences";

import LogService from "@/kernel/app/LogService";
import SecurityService from "@/kernel/app/SecurityService";

import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";

import { translate } from "@/util/translations";
import translations from "./translations";

import {
  ForgotPinMenu,
  ImportBackupScreen,
  LegacyRevealScreen,
  NuclearWipeScreen,
  LockScreenWrapper,
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
  const isPinConfigured = Security.isPinConfigured();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordMode = authMode === "password";
  const shouldShowPin = isPinConfigured;
  const shouldShowBio = hasBiometric;

  // Check biometric availability directly from plugin (not Redux).
  // Lock screen can mount before deviceInit runs.
  useEffect(function checkBiometric() {
    SimpleEncryption.isBiometricAvailable().then(({ value }) => {
      setHasBiometric(value);
    });
  }, []);

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

  // Auto-trigger biometric on mount.
  // Safe: lock screen only mounts when app IS visible (never during pause).
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
      <div className="flex flex-col items-center mb-6">
        <SeleneLogo className="w-16 h-16 mb-4" />
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Selene Wallet
        </h1>
      </div>

      <div className="flex items-center gap-2 mb-4 text-neutral-700 dark:text-neutral-300">
        <LockOutlined />
        <span>{translate(translations.enterPinPrompt)}</span>
      </div>

      {shouldShowPin && (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode={isPasswordMode ? undefined : "numeric"}
            pattern={isPasswordMode ? undefined : "[0-9]*"}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={translate(translations.enterPin)}
            className="w-full p-3 mb-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-center text-xl tracking-widest"
            autoFocus
            disabled={isLoading}
          />

          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-center text-sm">
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
            disabled={!pin || isLoading}
          />
        </form>
      )}

      {shouldShowBio && (
        <div className={shouldShowPin ? "mt-3" : ""}>
          <Button
            fullWidth
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
          fullWidth
          label={translate(translations.forgotPin)}
          onClick={() => navigate("/forgot-pin")}
          labelSize="sm"
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
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">
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
        <Route path="/forgot-pin/import" element={<ImportBackupScreen />} />
        <Route path="/forgot-pin/reveal" element={<LegacyRevealScreen />} />
        <Route path="/forgot-pin/wipe" element={<NuclearWipeScreen />} />
      </Routes>
    </MemoryRouter>
  );
}
