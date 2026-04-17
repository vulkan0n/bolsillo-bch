import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";

import LogService from "@/kernel/app/LogService";

const Log = LogService("GoogleAuth");

// --------------------------------

const WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string;

// Scope requerido para acceder al App Data folder de Google Drive.
// Este scope solo da acceso a la carpeta privada de la app — no al Drive completo.
const DRIVE_APPDATA_SCOPE =
  "https://www.googleapis.com/auth/drive.appdata";

// ----------------

let isInitialized = false;

async function initialize(): Promise<void> {
  if (isInitialized) return;

  await GoogleSignIn.initialize({
    clientId: WEB_CLIENT_ID,
    scopes: [DRIVE_APPDATA_SCOPE],
  });

  isInitialized = true;
  Log.debug("GoogleSignIn initialized");
}

// --------------------------------

export interface GoogleUser {
  userId: string;
  email: string | null;
  displayName: string | null;
  accessToken: string | null;
}

// --------------------------------

/**
 * Inicia el flujo de Google Sign-In y retorna los datos del usuario.
 * El accessToken incluye el scope drive.appdata — listo para usar con GoogleDriveService.
 */
export async function signIn(): Promise<GoogleUser> {
  await initialize();

  Log.info("Starting Google Sign-In flow");
  const result = await GoogleSignIn.signIn();

  Log.info(`Signed in as: ${result.email}`);

  return {
    userId: result.userId,
    email: result.email,
    displayName: result.displayName,
    accessToken: result.accessToken,
  };
}

// ----------------

/**
 * Cierra la sesión de Google. No afecta la wallet ni el backup en Drive.
 * Útil si el usuario quiere cambiar de cuenta.
 */
export async function signOut(): Promise<void> {
  await initialize();
  await GoogleSignIn.signOut();
  Log.info("Signed out from Google");
}
