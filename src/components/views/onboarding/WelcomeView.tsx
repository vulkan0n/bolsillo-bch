import { useCallback, useState } from "react";

import { store } from "@/redux";
import { setPreference } from "@/redux/preferences";

import DatabaseService from "@/kernel/app/DatabaseService";
import JanitorService from "@/kernel/app/JanitorService";
import LogService from "@/kernel/app/LogService";
import {
  backupActiveWallet,
  checkHasBackup,
  googleSignIn,
  restoreFromBackup,
} from "@/kernel/backup/CloudBackupService";

import FullColumn from "@/layout/FullColumn";
import Button from "@/atoms/Button";
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

  const handleGoogleSignIn = useCallback(
    async function handleGoogleSignIn() {
      setStep("signing-in");
      setErrorMessage("");

      try {
        // 1. Google Sign-In — obtiene userId y accessToken con scope drive.appdata
        const user = await googleSignIn();

        if (!user.accessToken) {
          throw new Error(
            "No se obtuvo acceso a Google Drive. Intentá de nuevo."
          );
        }

        setStep("checking");

        // 2. ¿Hay backup en Drive para esta cuenta?
        const hasBackup = await checkHasBackup(user.accessToken);

        if (hasBackup) {
          // ── Camino de restauración ──
          Log.info("Backup found — restoring wallet");
          setStep("restoring");

          // Necesitamos la DB abierta para importar la wallet
          await DatabaseService().openAppDatabase();
          await JanitorService().migrateLegacyDatabases();

          const result = await restoreFromBackup(user.userId, user.accessToken);

          if (!result.isSuccess || !result.walletHash) {
            throw new Error(
              result.error ?? "Error al restaurar la wallet desde el backup."
            );
          }

          // Activar el walletHash restaurado para que boot() lo encuentre
          store.dispatch(
            setPreference({
              key: "activeWalletHash",
              value: result.walletHash,
            })
          );

          await boot();
        } else {
          // ── Camino de wallet nueva ──
          Log.info("No backup found — creating new wallet");

          // boot() crea la wallet automáticamente si activeWalletHash está vacío
          await boot();

          // Backup asíncrono — no bloqueamos al usuario
          backupActiveWallet(user.userId, user.accessToken).catch((e) => {
            Log.warn("Background backup failed (non-critical):", e);
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        Log.error("WelcomeView error:", msg);
        setErrorMessage(msg);
        setStep("error");
      }
    },
    [boot]
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
    <FullColumn className="justify-center items-center bg-neutral-100 dark:bg-neutral-900 p-6">
      <div className="flex flex-col items-center w-full max-w-sm gap-8">
        {/* Logo */}
        <SeleneLogo className="w-28 h-28" />

        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Bolsillo BCH
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tu billetera de Bitcoin Cash para cobros en pesos
          </p>
        </div>

        {/* Botón Google */}
        <div className="w-full flex flex-col gap-3">
          <Button
            label={stepLabel[step]}
            disabled={isLoading}
            bgColor="bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            activeBgColor="bg-neutral-100 dark:bg-neutral-700"
            labelColor="text-neutral-800 dark:text-neutral-100 font-semibold"
            activeLabelColor="text-neutral-700 dark:text-neutral-200"
            borderClasses="border border-neutral-300 dark:border-neutral-600"
            rounded="xl"
            padding="px-4 py-3"
            onClick={handleGoogleSignIn}
          />

          {/* Error */}
          {step === "error" && errorMessage && (
            <p className="text-sm text-center text-red-500 dark:text-red-400 px-2">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Nota de privacidad */}
        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 px-4">
          Tu billetera se guarda de forma encriptada en tu Google Drive privado.
          Nadie más puede acceder a tus fondos.
        </p>
      </div>
    </FullColumn>
  );
}
