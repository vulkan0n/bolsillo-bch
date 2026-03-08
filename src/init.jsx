import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
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

import ErrorBoundary from "@/layout/ErrorBoundary";

import Main from "@/Main";

// Top-Level execution for entire app starts here!
// eslint-disable-next-line react-refresh/only-export-components
const Log = LogService("init");

// 1. Cold start
async function initialize_app() {
  Log.time("INIT");

  let startupError = null;
  try {
    await JanitorService().fsck();
    await SecurityService().initEncryption();

    if (SecurityService().isEncryptionReady()) {
      if (await boot()) {
        redux_resume(); // walletConnect, stats, exchange rates
      } else {
        SecurityService().lock();
      }
    }
  } catch (e) {
    if (e instanceof DecryptionFailedError) {
      Log.error("Decryption failed, routing to lock screen", e);
      await SecurityService().lock();
    } else {
      Log.error("INIT FAILED", e);
      startupError = e;
    }
  }

  App.addListener("pause", app_pause);
  App.addListener("resume", app_resume);

  const root = createRoot(document.getElementById("root"));

  if (startupError) {
    root.render(
      <StrictMode>
        <ErrorBoundary startupError={startupError} />
      </StrictMode>
    );
    await SplashScreen.hide();
    return;
  }

  root.render(
    <StrictMode>
      <Provider store={store}>
        <Main />
      </Provider>
    </StrictMode>
  );

  await SplashScreen.hide();

  Log.timeEnd("INIT");
}

// 2. Boot: open DBs, migrations, load wallet
async function boot() {
  Log.log("* BOOT *");
  Log.time("boot");

  await DatabaseService().openAppDatabase();

  await Promise.all([
    JanitorService().migrateLegacyDatabases(),
    redux_pre_init(),
  ]);

  if (!(await JanitorService().handleAuthMigration())) {
    Log.timeEnd("boot");
    return false;
  }

  await JanitorService().recoverWalletFiles();
  await redux_init(); // walletBoot -> syncConnect

  Log.timeEnd("boot");
  return true;
}

// Called by AppLockScreen after successful PIN/biometric auth
export async function onUnlocked() {
  if (!(await boot())) {
    SecurityService().lock();
    return;
  }
  SecurityService().unlock();
  redux_resume();
}

// Lifecycle handlers
async function app_pause() {
  Log.time("APP_PAUSE");
  const { authMode, authActions } = selectSecuritySettings(store.getState());
  if (authMode !== "none" && authActions.includes(AuthActions.AppResume)) {
    await SecurityService().lock();
  }
  await redux_pause();
  Log.timeEnd("APP_PAUSE");
}

function app_resume() {
  Log.time("APP_RESUME");
  redux_resume();
  Log.timeEnd("APP_RESUME");
}

// Go!
initialize_app();
