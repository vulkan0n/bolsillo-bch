import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";

import {
  store,
  redux_init,
  redux_pre_init,
  redux_resume,
  redux_pause,
} from "@/redux";
import { selectSecuritySettings } from "@/redux/preferences";

import DatabaseService, {
  DecryptionFailedError,
} from "@/kernel/app/DatabaseService";
import JanitorService from "@/kernel/app/JanitorService";
import LogService from "@/kernel/app/LogService";
import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";

import AppLockScreen from "@/views/security/AppLockScreen";
import ErrorBoundary from "@/layout/ErrorBoundary";

const Log = LogService("BootProvider");

// --------------------------------

type Phase =
  | "PREFLIGHT"
  | "LOCKED"
  | "BOOTING"
  | "RUNNING"
  | "PAUSED"
  | "STARTUP_ERROR";

interface BootProviderProps {
  children: ReactNode;
}

export default function BootProvider({ children }: BootProviderProps) {
  const [phase, setPhase] = useState<Phase>("PREFLIGHT");
  const [startupError, setStartupError] = useState<Error | null>(null);
  const phaseRef = useRef<Phase>("PREFLIGHT");

  // Keep ref in sync so Capacitor listeners see current phase
  phaseRef.current = phase;

  // ----------------
  // boot: open DBs, migrations, load wallet, start sync
  const boot = useCallback(async function boot() {
    Log.log("* BOOT *");
    Log.time("boot");
    setPhase("BOOTING");
    phaseRef.current = "BOOTING";

    try {
      await DatabaseService().openAppDatabase();

      await Promise.all([
        JanitorService().migrateLegacyDatabases(),
        redux_pre_init(),
      ]);

      if (!(await JanitorService().handleAuthMigration())) {
        Log.timeEnd("boot");
        setPhase("LOCKED");
        phaseRef.current = "LOCKED";
        return;
      }

      await JanitorService().recoverWalletFiles();
      await redux_init();
      redux_resume();

      setPhase("RUNNING");
      phaseRef.current = "RUNNING";
      Log.timeEnd("boot");
    } catch (e) {
      Log.error("BOOT FAILED", e);
      setStartupError(e instanceof Error ? e : new Error(String(e)));
      setPhase("STARTUP_ERROR");
      phaseRef.current = "STARTUP_ERROR";
      Log.timeEnd("boot");
    }
  }, []);

  // ----------------
  // Cold start: fsck → initEncryption → decide phase
  useEffect(
    function coldStart() {
      async function run() {
        Log.time("INIT");

        try {
          await JanitorService().fsck();
          const isKeyLoaded = await SecurityService().initEncryption();

          if (isKeyLoaded) {
            await boot();
          } else {
            setPhase("LOCKED");
            phaseRef.current = "LOCKED";
          }
        } catch (e) {
          if (e instanceof DecryptionFailedError) {
            Log.error("Decryption failed, routing to lock screen", e);
            setPhase("LOCKED");
            phaseRef.current = "LOCKED";
          } else {
            Log.error("INIT FAILED", e);
            setStartupError(e instanceof Error ? e : new Error(String(e)));
            setPhase("STARTUP_ERROR");
            phaseRef.current = "STARTUP_ERROR";
          }
        }

        Log.timeEnd("INIT");
      }

      run();
    },
    [boot]
  );

  // ----------------
  // Capacitor pause/resume listeners
  useEffect(function setupLifecycleListeners() {
    async function handlePause() {
      Log.time("APP_PAUSE");

      // Only pause when the app is fully running
      if (phaseRef.current !== "RUNNING") {
        Log.debug("APP_PAUSE ignored (phase:", phaseRef.current, ")");
        Log.timeEnd("APP_PAUSE");
        return;
      }

      const { authMode, authActions } = selectSecuritySettings(
        store.getState()
      );

      await redux_pause();

      if (authMode !== "none" && authActions.includes(AuthActions.AppResume)) {
        await SecurityService().securePause();
        setPhase("PAUSED");
        phaseRef.current = "PAUSED";
      }

      Log.timeEnd("APP_PAUSE");
    }

    function handleResume() {
      Log.time("APP_RESUME");
      const { current } = phaseRef;

      if (current === "PAUSED") {
        // Transition to LOCKED — lock screen mounts, biometric auto-triggers
        setPhase("LOCKED");
        phaseRef.current = "LOCKED";
      } else if (current === "RUNNING") {
        redux_resume();
      }

      Log.timeEnd("APP_RESUME");
    }

    App.addListener("pause", handlePause);
    App.addListener("resume", handleResume);

    return () => {
      App.removeAllListeners();
    };
  }, []);

  // ----------------
  // Hide splash on first transition out of PREFLIGHT
  useEffect(
    function hideSplashWhenReady() {
      if (phase !== "PREFLIGHT") {
        SplashScreen.hide();
      }
    },
    [phase]
  );

  // --------------------------------
  // Render based on phase
  if (phase === "STARTUP_ERROR") {
    return <ErrorBoundary startupError={startupError} />;
  }

  if (phase === "PREFLIGHT" || phase === "BOOTING") {
    return null; // native splash covers
  }

  if (phase === "LOCKED") {
    return <AppLockScreen boot={boot} />;
  }

  // RUNNING or PAUSED — show the app
  return children;
}
