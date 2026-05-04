import { useCallback, useEffect, useState } from "react";

import { store } from "@/redux";
import { setPreference } from "@/redux/preferences";

import DatabaseService from "@/kernel/app/DatabaseService";
import JanitorService from "@/kernel/app/JanitorService";
import LogService from "@/kernel/app/LogService";
import {
  backupActiveWallet,
  checkHasBackup,
  googleHandleRedirectCallback,
  googleSignIn,
  restoreFromBackup,
  type GoogleUser,
} from "@/kernel/backup/CloudBackupService";

import FullColumn from "@/layout/FullColumn";
import AppButton from "@/atoms/AppButton";
import SeleneLogo from "@/atoms/SeleneLogo";

const Log = LogService("WelcomeView");

// --------------------------------

interface WelcomeViewProps {
  boot: () => Promise<void>;
}

// ----------------

type Step = "idle" | "signing-in" | "checking" | "restoring" | "error";

// --------------------------------

export default function WelcomeView({ boot }: WelcomeViewProps) {
  const [step, setStep] = useState<Step>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ----------------

  // En web, Google redirige de vuelta con #id_token en la URL.
  // Capturamos ese token al montar el componente.
  useEffect(function handleWebRedirectCallback() {
    if (!window.location.hash.includes("id_token")) return;

    async function processRedirect() {
      setStep("signing-in");
      try {
        const user = await googleHandleRedirectCallback();
        if (!user) return;
        await continueAfterSignIn(user);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        Log.error("Redirect callback error:", msg);
        setErrorMessage(msg);
        setStep("error");
      }
    }

    processRedirect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------

  async function continueAfterSignIn(user: GoogleUser) {
    if (!user.accessToken) {
      throw new Error("No se obtuvo acceso a Google Drive. Intentá de nuevo.");
    }

    setStep("checking");
    const hasBackup = await checkHasBackup(user.accessToken);

    if (hasBackup) {
      Log.info("Backup found — restoring wallet");
      setStep("restoring");
      await DatabaseService().openAppDatabase();
      await JanitorService().migrateLegacyDatabases();
      const result = await restoreFromBackup(user.userId, user.accessToken);
      if (!result.isSuccess || !result.walletHash) {
        throw new Error(
          result.error ?? "Error al restaurar la wallet desde el backup."
        );
      }
      store.dispatch(
        setPreference({ key: "activeWalletHash", value: result.walletHash })
      );
      await boot();
    } else {
      Log.info("No backup found — creating new wallet");
      await boot();
      backupActiveWallet(user.userId, user.accessToken).catch((e) => {
        Log.warn("Background backup failed (non-critical):", e);
      });
    }
  }

  // ----------------

  const handleGoogleSignIn = useCallback(
    async function handleGoogleSignIn() {
      setStep("signing-in");
      setErrorMessage("");
      try {
        const user = await googleSignIn();
        await continueAfterSignIn(user);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        Log.error("WelcomeView error:", msg);
        setErrorMessage(msg);
        setStep("error");
      }
    },
    [boot] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ----------------

  const isLoading =
    step === "signing-in" || step === "checking" || step === "restoring";

  const stepLabel: Record<Step, string> = {
    idle: "Entrar con Google",
    "signing-in": "Iniciando sesión...",
    checking: "Verificando backup...",
    restoring: "Restaurando billetera...",
    error: "Entrar con Google",
  };

  // --------------------------------

  return (
    <FullColumn className="justify-center items-center bg-neutral-25 dark:bg-neutral-1000 px-6 pt-safe-top pb-safe-bottom">
      <div className="flex flex-col items-center w-full max-w-sm">
        <SeleneLogo className="w-24 h-24 mb-8" />

        <h1 className="text-h1 text-neutral-900 dark:text-neutral-100 text-center mb-2">
          Bolsillo BCH
        </h1>

        <p className="text-body text-neutral-500 dark:text-neutral-400 text-center mb-10">
          Enviá y recibí Bitcoin Cash de forma simple, sin bancos, sin esperas.
        </p>

        <div className="w-full mb-6">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onClick={handleGoogleSignIn}
          >
            {stepLabel[step]}
          </AppButton>

          {step === "error" && errorMessage && (
            <p className="text-sm text-error text-center mt-3">
              {errorMessage}
            </p>
          )}
        </div>

        <p className="text-sm text-neutral-400 dark:text-neutral-400 text-center leading-relaxed max-w-xs">
          Tu billetera se guarda de forma encriptada en tu Google Drive privado.
          Nadie más puede acceder a tus fondos.
        </p>
      </div>
    </FullColumn>
  );
}
