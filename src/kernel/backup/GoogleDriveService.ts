/* eslint-disable @typescript-eslint/naming-convention */
import LogService from "@/kernel/app/LogService";

import type { EncryptedBackup } from "./CloudEncryption";

const Log = LogService("GoogleDrive");

// --------------------------------

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

// Nombre del archivo en el App Data folder. Un único archivo — cada backup
// sobreescribe el anterior. No guardamos historial de versiones en Drive.
const BACKUP_FILE_NAME = "bolsillo-backup.json";

// ----------------

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

// --------------------------------

/**
 * Busca el archivo de backup en el App Data folder.
 * Retorna el archivo más reciente, o null si no existe.
 */
async function findBackupFile(accessToken: string): Promise<DriveFile | null> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    fields: "files(id,name,modifiedTime)",
    q: `name = '${BACKUP_FILE_NAME}'`,
    orderBy: "modifiedTime desc",
    pageSize: "1",
  });

  const response = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Drive list failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const files: DriveFile[] = data.files ?? [];
  return files.length > 0 ? files[0] : null;
}

// --------------------------------

/**
 * Sube el backup encriptado al App Data folder de Google Drive.
 * Si ya existe un archivo anterior lo sobreescribe (update), si no lo crea.
 */
export async function uploadBackup(
  backup: EncryptedBackup,
  accessToken: string
): Promise<void> {
  const content = JSON.stringify(backup);
  const existing = await findBackupFile(accessToken);

  if (existing) {
    Log.info(`Updating existing backup file: ${existing.id}`);
    await updateDriveFile(existing.id, content, accessToken);
  } else {
    Log.info("Creating new backup file in App Data folder");
    await createDriveFile(content, accessToken);
  }
}

// ----------------

async function createDriveFile(
  content: string,
  accessToken: string
): Promise<void> {
  const metadata = {
    name: BACKUP_FILE_NAME,
    parents: ["appDataFolder"],
  };

  const boundary = "bolsillo_bch_backup_boundary";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json",
    "",
    content,
    `--${boundary}--`,
  ].join("\r\n");

  const response = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Drive create failed: ${response.status} ${response.statusText}`
    );
  }
}

// ----------------

async function updateDriveFile(
  fileId: string,
  content: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: content,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Drive update failed: ${response.status} ${response.statusText}`
    );
  }
}

// --------------------------------

/**
 * Descarga el backup desde el App Data folder.
 * Retorna null si no existe ningún backup para esta cuenta.
 */
export async function downloadBackup(
  accessToken: string
): Promise<EncryptedBackup | null> {
  const file = await findBackupFile(accessToken);

  if (!file) {
    Log.info("No backup found in Drive App Data folder");
    return null;
  }

  Log.info(
    `Downloading backup file: ${file.id} (modified: ${file.modifiedTime})`
  );

  const response = await fetch(`${DRIVE_API}/files/${file.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Drive download failed: ${response.status} ${response.statusText}`
    );
  }

  const backup: EncryptedBackup = await response.json();
  return backup;
}

// --------------------------------

/**
 * Retorna true si ya existe un archivo de backup en Drive para esta cuenta.
 * Útil para decidir en el onboarding si ofrecer "Restaurar" o "Crear nueva wallet".
 */
export async function hasBackup(accessToken: string): Promise<boolean> {
  const file = await findBackupFile(accessToken);
  return file !== null;
}
