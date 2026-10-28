# Publicar una versión en el repo F-Droid

## Arquitectura de repos

Hay dos repos con roles distintos:

- **`bolsillo-bch`** (este repo): código fuente, desarrollo, tests y builds. Es la fuente de verdad.
- **`vulkan0n/fdroid`**: solo distribuye APKs firmados + índice F-Droid. No tiene código fuente.

El flujo siempre es: desarrollar y buildear acá → copiar el APK al repo F-Droid → `fdroid update` → push.
El cliente F-Droid detecta la versión nueva cuando sube el `versionCode`.

Repositorio: https://vulkan0n.github.io/fdroid/repo/
Huella de la clave del repo (SHA-256):

```
9B:64:30:59:F7:46:6E:DC:9F:29:0B:15:1F:A7:D1:ED:AA:61:A9:CB:31:A8:A2:74:45:09:CF:80:4E:C6:28:9B
```

## Prerrequisitos

- Java 21 y Android SDK (build-tools con `apksigner`).
- `fdroidserver` 2.4.5 (`python3 -m pip install --user fdroidserver==2.4.5`).
- `android/keystore.properties` + `android/bolsillo-release.keystore` (firma del APK).
- Directorio de trabajo del repo F-Droid fuera de este repo (por ejemplo
  `../bolsillo-fdroid/`) con `config.yml` y `keystore.p12`.

> `config.yml` y `keystore.p12` son secretos. No se commitean. Respaldalos.

## 1. Bump de versión

Editar `android/app/build.gradle`:

```gradle
versionCode 260316        // +1 respecto de la versión publicada
versionName "2026.03.16"
```

## 2. Build del APK release

```bash
pnpm install --frozen-lockfile
pnpm build:ci
npx cap sync android
cd android
./gradlew clean assembleRelease
```

Salida: `android/app/build/outputs/apk/release/app-release.apk`.

> No usar `pnpm build`: corre lint y el repo tiene errores de lint preexistentes.
> Usar `pnpm vitest run` aparte si se quieren correr los tests.

## 3. Verificar el APK

```bash
APK=android/app/build/outputs/apk/release/app-release.apk
$ANDROID_HOME/build-tools/36.1.0/apksigner verify --print-certs "$APK"
sha256sum "$APK"
```

La firma debe ser `CN=Bolsillo BCH` y el SHA-1 del certificado debe ser
`FC:AC:2C:51:C9:AE:98:74:83:84:6A:B8:3E:EE:1B:AF:54:BD:9F:28`.

## 4. Actualizar el repo F-Droid

```bash
cd ../bolsillo-fdroid
cp ../bolsillo-bch/android/app/build/outputs/apk/release/app-release.apk \
   repo/bch.bolsillo.app_<versionCode>.apk
fdroid update
```

Verificar que el índice incluya la versión nueva:

```bash
python3 -c "import json; d=json.load(open('repo/index-v1.json')); \
print([(p['versionCode'], p['versionName']) for p in d['packages']['bch.bolsillo.app']])"
```

## 5. Publicar

```bash
git add repo/
git commit -m "chore(fdroid): publicar <versionName>"
git push
```

GitHub Pages publica automáticamente. Verificar:

```bash
curl -sI https://vulkan0n.github.io/fdroid/repo/index.xml
```

## Google OAuth (solo release)

El APK de F-Droid se firma con `bolsillo-release.keystore`, no con la firma de
Google Play. En el proyecto OAuth `508614111965` existe el **Android OAuth client**
`508614111965-46o7gj1r4vj7c272o6ubejbbvecala05` con:

- Package name: `bch.bolsillo.app`
- SHA-1: `FC:AC:2C:51:C9:AE:98:74:83:84:6A:B8:3E:EE:1B:AF:54:BD:9F:28`

Si se regenera la keystore hay que crear un cliente nuevo. Sin ese cliente,
Google Sign-In devuelve `DEVELOPER_ERROR` (código 10) solo en el APK de
release. El Web Client ID sigue siendo
`508614111965-imvqdlbkvks0jmauqslr29g9m104b7tv`.

## Notas

- El APK de F-Droid se firma con `bolsillo-release.keystore`, distinto de la firma
  de Google Play. Instalar sobre una versión de Play requiere desinstalar primero.
- `jarsigner` puede advertir por SHA1/SHA1withRSA al verificar `index-v1.jar`:
  es esperado en repos F-Droid (compatibilidad con clientes viejos).
- El repo F-Droid no aplica la política de dependencias propietarias de F-Droid
  oficial; la app declara `NonFreeDep` por `play-services-auth`.
