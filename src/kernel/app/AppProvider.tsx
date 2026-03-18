import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";

import {
  redux_init,
  redux_pause,
  redux_pre_init,
  redux_resume,
  store,
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

const Log = LogService("AppProvider");

// --------------------------------

type Phase =
  | "PREFLIGHT"
  | "LOCKED"
  | "BOOTING"
  | "RUNNING"
  | "PAUSED"
  | "STARTUP_ERROR";

// --------------------------------

function useAppLifecycle() {
  const [phase, setPhase] = useState<Phase>("PREFLIGHT");
  const [startupError, setStartupError] = useState<Error | null>(null);
  const phaseRef = useRef<Phase>("PREFLIGHT");
  const pausePromiseRef = useRef<Promise<void> | null>(null);

  // Keep ref in sync so Capacitor listeners see current phase
  phaseRef.current = phase;

  function handlePhaseTransition(next: Phase) {
    setPhase(next);
    phaseRef.current = next;
  }

  // ----------------
  // boot: open DBs, migrations, load wallet, start sync.
  // Does NOT set intermediate phase — caller controls what shows during boot
  // (cold start shows BOOTING/null with splash; lock screen stays LOCKED).
  const boot = useCallback(async function boot() {
    Log.log("* BOOT *");
    Log.time("boot");

    // Wait for any in-flight pause to finish (close DBs, clear key)
    // before we try to reopen everything.
    if (pausePromiseRef.current) {
      await pausePromiseRef.current;
      pausePromiseRef.current = null;
    }

    try {
      await DatabaseService().openAppDatabase();
      await JanitorService().migrateLegacyDatabases();

      if (!(await JanitorService().handleAuthMigration())) {
        Log.timeEnd("boot");
        handlePhaseTransition("LOCKED");
        return;
      }

      await JanitorService().recoverWalletFiles();
      await redux_init();
      redux_resume();

      handlePhaseTransition("RUNNING");
      Log.timeEnd("boot");
    } catch (e) {
      Log.error("BOOT FAILED", e);
      setStartupError(new Error(String(e)));
      handlePhaseTransition("STARTUP_ERROR");
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
          await redux_pre_init();
          const isKeyLoaded = await SecurityService().initEncryption();

          if (isKeyLoaded) {
            // No auth configured — boot behind splash
            handlePhaseTransition("BOOTING");
            await boot();
          } else {
            // Plugin requires auth (PIN or biometric) before key loads
            handlePhaseTransition("LOCKED");
          }
        } catch (e) {
          if (e instanceof DecryptionFailedError) {
            Log.error("Decryption failed, routing to lock screen", e);
            handlePhaseTransition("LOCKED");
          } else {
            Log.error("INIT FAILED", e);
            setStartupError(new Error(String(e)));
            handlePhaseTransition("STARTUP_ERROR");
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
      const shouldLock =
        authMode !== "none" && authActions.includes(AuthActions.AppResume);

      // Transition phase synchronously BEFORE async work.
      // This eliminates the race where resume fires mid-pause.
      if (shouldLock) {
        handlePhaseTransition("PAUSED");
      }

      // Track async cleanup so boot() can await it if resume is fast.
      const cleanup = (async () => {
        try {
          await redux_pause();

          if (shouldLock) {
            await SecurityService().securePause();
          }
        } catch (e) {
          Log.error("APP_PAUSE failed", e);
        }
      })();
      pausePromiseRef.current = cleanup;
      await cleanup;

      Log.timeEnd("APP_PAUSE");
    }

    function handleResume() {
      Log.time("APP_RESUME");
      const { current } = phaseRef;

      if (current === "PAUSED") {
        // Transition to LOCKED — lock screen mounts, biometric auto-triggers
        handlePhaseTransition("LOCKED");
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

  return { phase, startupError, boot };
}

// --------------------------------

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const { phase, startupError, boot } = useAppLifecycle();

  switch (phase) {
    case "PREFLIGHT":
    case "BOOTING":
    case "PAUSED":
      return null; // native splash covers; PAUSED = cleanup in progress
    case "LOCKED":
      return <AppLockScreen boot={boot} />;
    case "RUNNING":
      return children;
    case "STARTUP_ERROR":
    default:
      return (
        <ErrorBoundary
          startupError={startupError ?? new Error(`Unknown phase: ${phase}`)}
        />
      );
  }
}
