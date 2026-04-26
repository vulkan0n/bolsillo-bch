# Notas: Bolsillo.BCH - Fork de Wallet BCH para Comercios

## Contexto del proyecto

El objetivo es adaptar una wallet BCH open source para comercios que
**no son cripto-entusiastas**. Ciertas dinámicas importantes para la
comunidad BCH (autocustodia, 12 palabras, transacciones en BCH) son
demasiado complejas para el usuario promedio.

La estrategia es **adaptar en lugar de construir desde cero**, tocando
la capa de UX/presentación sin reinventar la arquitectura de protocolo.

---

## ¿Por qué es viable?

- Las wallets BCH maduras tienen la lógica de protocolo (firmar
  transacciones, comunicarse con nodos, derivar claves) **bien
  separada** de la capa de presentación.
- No hace falta entender ECDSA para cambiar el onboarding, la pantalla
  de saldo, o el flujo de cobro.
- El trabajo real está en la **capa de experiencia de usuario**, no en
  el protocolo.

---

## Wallet base elegida: Selene Wallet

- **Repo:** https://git.xulu.tech/selene.cash/selene-wallet
- **Licencia:** BSD-3 (permite forkear y distribuir libremente)
- **Estado:** Activo (~2857 commits, 11 releases)
- **Desarrollado por:** Kallisti.cash + The Bitcoin Cash Podcast

### Stack tecnológico real (confirmado inspeccionando package.json)

| Capa                    | Tecnología                           |
| ----------------------- | ------------------------------------ |
| UI / Framework          | React 19 + Vite                      |
| Estilos                 | Tailwind CSS                         |
| Estado global           | Redux Toolkit                        |
| Lógica de protocolo BCH | @bitauth/libauth + @electrum-cash    |
| Empaquetado móvil       | Capacitor 8                          |
| Package manager         | pnpm (obligatorio, bloquea npm/yarn) |
| Tests                   | Vitest + Playwright (e2e)            |

> ⚠️ No es React Native ni Expo como se pensaba inicialmente.
> Es una app web (React + Vite) empaquetada como app nativa
> mediante Capacitor. Esto es mejor para el desarrollo: el
> 90% del trabajo de UI se puede hacer y probar directamente
> en el navegador.

### Por qué es una buena base

- **React + Vite** = desarrollo rápido, hot reload, ecosistema
  enorme. No se necesita Swift ni Kotlin.
- **Capacitor** maneja el puente hacia las APIs nativas del
  dispositivo (cámara, clipboard, filesystem, etc).
- **@bitauth/libauth** y **@electrum-cash** manejan toda la
  complejidad criptográfica. No hay que tocarlos.
- La separación UI / protocolo es clara y real.

---

## Qué se tocaría en el fork

```
Tu fork (modificás)               Selene (no tocás)
────────────────────────          ──────────────────────────────
Pantallas de onboarding      →    Derivación de seed (BIP39/44)
Flujo de cobro para comercio →    Firma y broadcast de txs
Denominación en ARS + BCH    →    Comunicación con nodos Electrum
Mensajes de error amigables  →    Validación de direcciones
Settings simplificados       →    Lógica UTXO / libauth
```

### Ideas concretas de UX

- **Onboarding progresivo:** el usuario empieza a usar la wallet
  de inmediato; las 12 palabras se introducen en un segundo paso,
  explicadas como "tu contraseña maestra de respaldo".
- **Modo comerciante:** pantalla de cobro con monto en ARS →
  genera QR con equivalente en BCH → confirmación al recibir pago.
- **Denominación local:** mostrar siempre el equivalente en ARS
  junto al valor en BCH.
- **Settings simplificados:** opciones avanzadas (derivation path,
  xpub, servidor Electrum) ocultas en un menú "para expertos".

---

## Idea de recuperación con cuenta de Google

### Concepto

Al abrir la app por primera vez, el usuario se loguea con Google.
La wallet se crea normalmente (seed generada en el dispositivo),
y la seed encriptada se guarda en el **Google Drive del propio
usuario** (carpeta privada de app data, invisible en su Drive
normal). Al reinstalar en otro celular y loguearse con la misma
cuenta, la wallet se restaura automáticamente.

### El espectro de opciones

| Opción | Descripción                          | Custodia                |
| ------ | ------------------------------------ | ----------------------- |
| A      | Seed encriptada en Drive del usuario | El usuario (vía Google) |
| B      | Shamir: dispositivo + Drive + server | Compartida              |
| C      | Claves en servidor propio            | Vos (custodio)          |

**Recomendación:** Opción A como default, con posibilidad de
hacer backup manual de las 12 palabras para usuarios avanzados.

### Stack técnico para implementarlo en Capacitor/React

- `@codetrix-studio/capacitor-google-auth` — auth con Google
- **Google Drive App Data API** — carpeta privada por app,
  no visible en el Drive del usuario

---

## Setup del entorno de desarrollo

### Prerequisitos (Linux)

```bash
# Node.js via fnm
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install --lts

# JDK 17 (para builds Android)
sudo apt update && sudo apt install openjdk-17-jdk

# Watchman
sudo apt install watchman

# pnpm (obligatorio, Selene bloquea npm y yarn)
npm install -g pnpm
```

### Android Studio

Descargar desde https://developer.android.com/studio.
Instalar: Android SDK, API 34, Emulator, Build-Tools.

Agregar al ~/.bashrc:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Clonar e instalar

```bash
git clone https://git.xulu.tech/selene.cash/selene-wallet.git
cd selene-wallet
pnpm install
```

### Comandos del día a día

```bash
pnpm dev          # app en navegador → http://localhost:5173
pnpm test         # lint + unit tests
pnpm build:ci     # genera bundle web (sin correr tests)

# Para probar en celular físico (USB):
npx cap sync android
npx cap run android
```

> El flujo normal es: editás en src/ → ves el cambio en
> el navegador al instante → cuando querés probar en el
> celular, hacés cap sync + cap run.

---

## Estructura del proyecto

```
selene-wallet/
├── src/            # todo el código fuente (acá trabajás)
├── android/        # proyecto Android generado por Capacitor
├── ios/            # proyecto iOS generado por Capacitor
├── assets/         # imágenes, íconos
├── public/         # archivos estáticos
├── e2e/            # tests end-to-end (Playwright)
└── scripts/        # utilidades de build
```

---

## Referencias útiles

- **Selene Wallet:** https://selene.cash
- **Repo:** https://git.xulu.tech/selene.cash/selene-wallet
- **Capacitor docs:** https://capacitorjs.com/docs
- **libauth (BCH):** https://libauth.org
- **Paytaca** — referencia de wallet orientada a comercios
  (El Salvador, Filipinas)
- **Wallets con social recovery en producción:** Valora Wallet
  (Celo), Coinbase Wallet (backup en iCloud/Google Drive)

---

## Estado del fork (2026-04-26)

### Configuración del repo

- Raíz del proyecto: contenido de selene-wallet movido directamente a `bolsillo-bch/`
- `origin` → https://github.com/vulkan0n/bolsillo-bch
- `upstream` → https://git.xulu.tech/selene.cash/selene-wallet
- Claude Code configurado sin Co-Authored-By en commits (`~/.claude/settings.json`)

### Entorno de desarrollo

- Node via fnm, pnpm obligatorio
- JDK 21 (necesario para Gradle 8.13 — el 17 no alcanza)
- Android Studio con SDK API 36 y Build-Tools 35
- Build APK debug: `pnpm build:ci && npx cap sync android && cd android && ./gradlew assembleDebug`
- APK de salida: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Nota:** `capacitor-assets generate --android` genera un `drawable/splash.png` que conflictúa con el `splash.xml` existente. Borrarlo después: `rm android/app/src/main/res/drawable/splash.png`

### Cambios realizados

- Logo de la app reemplazado: `src/assets/bolsillo-logo.svg` (íconos Android regenerados)
- Tab "Explore" eliminada de la navegación
- **Localización:** idioma default → español (`es`), moneda default → ARS
- **Branding:** "Selene" → "Bolsillo BCH" en toda la UI (traducciones, logos, footer)
- **Package ID:** `cash.selene.app` → `bch.bolsillo.app` (Android + capacitor.config.json)
- **Backup Google Drive:** ciclo completo probado en dispositivo físico (ver sección de backup)
- **Balance dual:** ARS arriba (grande) + BCH abajo siempre visibles, sin toggle
- **Logout:** botón "Cerrar sesión" en Settings — cierra sesión Google y vuelve a WelcomeView

### Google Cloud OAuth

- Proyecto: `bolsillo-bch`
- Web Client ID: `695566586090-7820ks7je4iuo1orf3voba9vfg0tkcq1.apps.googleusercontent.com`
- Android Client ID (release): registrado para `bch.bolsillo.app`
- Android Client ID (debug): registrado para `bch.bolsillo.app.edge`
- SHA1 debug keystore: `93:68:CA:05:9F:72:B1:CD:C1:1F:47:9C:D6:6C:92:55:C5:BE:F1:BF`
- App en modo prueba → agregar emails en: OAuth consent screen → Test users

### Próximos pasos pendientes

- Onboarding progresivo (simplificar el flujo de las 12 palabras)
- Modo Estable: bloqueado — MUSD tiene vulnerabilidad pendiente de fix por el equipo de Moria (ver sección abajo)
- Modo comerciante: pantalla de cobro con monto en ARS → QR BCH (baja prioridad)
- Diseño minimalista

---

## Modo Estable (stablecoin mode)

### Estado de la implementación upstream

El upstream Selene ya tiene `stablecoinMode` casi completamente implementado.
**No hay que construirlo desde cero.** Lo que existe:

| Componente                                                       | Archivo                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| Preferencia `stablecoinMode` + selector `selectIsStablecoinMode` | `src/redux/preferences.ts:48`                         |
| Auto-swap BCH→MUSD al recibir pago                               | `src/redux/wallet.ts:228-277`                         |
| Auto-swap MUSD→BCH al enviar (swap atómico + pago)               | `src/components/views/wallet/send/WalletViewSend.tsx` |
| Lógica de transacción con swap embebido                          | `src/kernel/bch/TransactionBuilderService.ts:536`     |
| Hook de balance MUSD (`useStablecoinBalance`)                    | `src/hooks/useStablecoinBalance.tsx`                  |
| Conexión automática a Cauldron al activar el modo                | `src/redux/sync.ts:97-111`                            |
| Toggle en Currency Settings                                      | `src/components/views/settings/CurrencySettings.jsx`  |
| Constante del token MUSD                                         | `src/util/tokens.ts` → `MUSD_TOKENID`                 |

**Token MUSD:** `b38a33f750f84c5c169a6f23cb873e6e79605021585d4f3408789689ed87f366`

**DEX utilizado:** Cauldron (`@cashlab/cauldron` v1.0.2), ya integrado en `src/kernel/bch/CauldronService.ts`

### Cómo funciona el diseño upstream (100% swap)

**Al recibir BCH:**

1. Se detecta el saldo nuevo en `redux/wallet.ts`
2. Se llama a `Cauldron.fetchPools(MUSD_TOKENID)` para obtener liquidez actualizada
3. Se swapea el 100% del BCH recibido a MUSD via `Cauldron.prepareTrade("BCH", MUSD_TOKENID, incomingSats, wallet, true)`
4. La fee de red del swap se descuenta del mismo BCH recibido (dentro de `prepareTrade`)
5. Resultado: wallet con 0 BCH y X MUSD

**Al enviar (con 0 BCH en wallet):**

1. `buildP2pkhTransaction()` falla porque no hay BCH → retorna un `bigint` con los sats que faltan
2. Se llama a `buildStablecoinTransaction(recipients, satsShort)` en `TransactionBuilderService.ts`
3. Se construye una **transacción atómica** que en un solo TX: swapea MUSD→BCH + paga al destinatario + paga fees de red
4. El destinatario recibe BCH directamente (no MUSD)

### Problema del diseño 100%: fragilidad ante Cauldron

| Situación                 | Resultado                         |
| ------------------------- | --------------------------------- |
| Cauldron tiene liquidez   | Funciona correctamente            |
| Pool de MUSD sin liquidez | **No se puede enviar nada**       |
| Cauldron caído o lento    | **Wallet paralizada**             |
| Transacción rechazada     | Se pierde la fee del swap fallido |

Además, cada envío paga **dos fees**: fee de red + spread del DEX (~0.3% de Cauldron).

### Ajuste pendiente: reserva del 1% como BCH

Para Bolsillo BCH se propone swapear solo el **99%** del BCH recibido, manteniendo 1% como reserva:

- Transacciones pequeñas se pagan con el BCH reservado sin tocar Cauldron
- Solo envíos grandes necesitan liquidar MUSD
- Si Cauldron está caído, las transacciones chicas siguen funcionando
- La reserva crece con cada pago recibido

**Cambio a implementar** en `src/redux/wallet.ts` (línea ~233):

```ts
// Upstream (actual):
const incomingSats = satsDiff - tokenSats; // 100% al swap

// Bolsillo BCH:
const totalIncoming = satsDiff - tokenSats;
const swapAmount = (totalIncoming * 99n) / 100n; // 99% → MUSD, 1% queda como BCH
```

El porcentaje (99%) es configurable a futuro — el usuario lo revisará.

### Estado actual (2026-04-26) — bloqueado

El equipo de Moria encontró una vulnerabilidad en el token MUSD y van a actualizar el token.
**No implementar Modo Estable hasta que el nuevo token esté desplegado y auditado.**
Cuando salga el nuevo token, actualizar `MUSD_TOKENID` en `src/util/tokens.ts`.

### Alternativa futura: ParyionUSD (PUSD)

Otra stablecoin en BCH en desarrollo: https://paryonusd.com/
Aún no está desplegada. Tener en cuenta como alternativa a MUSD.

### Pendiente de UI (cuando se desbloquee)

- Renombrar "Stablecoin Mode" → "Modo Estable" en la interfaz
- Mover el toggle a un lugar más visible (actualmente está en Currency Settings)
- Adaptar la descripción al contexto de ARS

---

## Backup en Google Drive (onboarding sin seed visible)

### Objetivo

El usuario abre la app, se loguea con Google, y la wallet se crea y respalda automáticamente. Sin 12 palabras visibles, sin contraseña extra, sin backend propio.

### Referencia: Valora Wallet

Se analizó el código de Valora Wallet (`valora-inc/wallet`). Valora usa un esquema de dos keyshares (Torus + backend propio) con AES-256-GCM. **No usan Google Drive** — guardan el mnemónico encriptado en su propio servidor (CAB). Requiere backend + integración con Torus. Demasiado complejo para nuestro caso.

Lo que sí se reutiliza de Valora: el patrón de encriptación (`AES-256-GCM` + `HKDF-SHA256`).

### Diseño elegido para Bolsillo BCH

Sin backend. Sin contraseña. Solo Google.

```
Google Sign-In → Google User ID (sub)
    ↓
HKDF(sub + app_salt) → clave AES-256
    ↓
AES-256-GCM(mnemonic) → archivo JSON encriptado
    ↓
Google Drive App Data folder (privado, invisible al usuario)
```

**Al restaurar en otro dispositivo:**

```
Google Sign-In (misma cuenta) → mismo sub
    ↓
HKDF(sub + app_salt) → misma clave AES-256
    ↓
Descargar archivo de Drive → desencriptar → importar wallet
```

### Por qué es seguro

- El archivo en Drive es inútil sin la cuenta Google (la clave se deriva del `sub`)
- `sub` es un ID opaco de Google, no el email — no adivinable
- AES-256-GCM autentica el ciphertext (detecta tampering)
- Google Drive App Data es una carpeta privada por app — no visible en el Drive del usuario
- Si el usuario pierde acceso a su cuenta Google → puede recuperar desde otro backup manual (opción avanzada)

### Implementación planeada

**Librerías:**
- `@codetrix-studio/capacitor-google-auth` — Google Sign-In en Capacitor
- `futoin-hkdf` — derivación de clave (HKDF-SHA256, mismo que Valora)
- `@noble/ciphers` o Web Crypto API — AES-256-GCM (disponible en WebView)
- Google Drive REST API — llamadas HTTP directas con el `accessToken`

**Archivos a crear:**
- `src/kernel/backup/GoogleAuthService.ts` — Sign-In, obtener sub + accessToken
- `src/kernel/backup/CloudEncryption.ts` — HKDF + AES-256-GCM (basado en Valora)
- `src/kernel/backup/GoogleDriveService.ts` — upload/download al App Data folder
- `src/kernel/backup/CloudBackupService.ts` — orquestación: crear backup, restaurar
- `src/components/views/onboarding/WelcomeView.tsx` — pantalla inicial con botón Google

**Archivos a modificar:**
- `src/kernel/app/AppProvider.tsx` — interceptar "no hay wallet" → mostrar WelcomeView
- rutas — agregar `/welcome`

### Scope de OAuth requerido

```
https://www.googleapis.com/auth/drive.appdata
```

Solo acceso a la carpeta privada de la app en Drive. No puede leer el Drive del usuario.

### Datos Google Cloud

> El Client Secret va en `.env.local` (gitignoreado), nunca en este archivo.

| Dato | Valor |
|---|---|
| Proyecto | bolsillo-bch |
| Web Client ID | `695566586090-7820ks7je4iuo1orf3voba9vfg0tkcq1.apps.googleusercontent.com` |
| Android Client ID | `695566586090-u6ethsk823nv2oceqg8idpvnvajbl5n9.apps.googleusercontent.com` |
| SHA1 (debug keystore) | `93:68:CA:05:9F:72:B1:CD:C1:1F:47:9C:D6:6C:92:55:C5:BE:F1:BF` |
| Client Secret | en `.env.local` → `GOOGLE_CLIENT_SECRET` |

### Estado final (2026-04-20)

Backup/restore probado y confirmado en dispositivo físico (Xiaomi, Android API 36).
Ciclo completo: nuevo usuario → Google Sign-In → wallet creada → backup subido →
desinstalar app → reinstalar → mismo Google Sign-In → wallet restaurada con balance correcto.

### Lecciones aprendidas de la implementación

#### 1. `futoin-hkdf` NO funciona en Capacitor/WebView

`futoin-hkdf` es una librería Node.js que usa `crypto.createHmac` internamente.
Vite la incluye en el bundle pero la minifica (ej: `NK`). En el Android WebView
no existe `node:crypto`, así que en runtime falla con `NK is not a function`.

**Solución:** usar la Web Crypto API nativa del browser (disponible en WebView):

```ts
// ❌ No usar:
import hkdf from "futoin-hkdf";
const keyBytes = hkdf(userId, 32, { salt, info, hash: "SHA-256" });

// ✅ Usar:
const baseKey = await crypto.subtle.importKey("raw", enc.encode(userId), "HKDF", false, ["deriveKey"]);
const cryptoKey = await crypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt, info }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
```

**Regla general:** cualquier librería que importe de `crypto`, `stream`, u otros
módulos de Node.js es incompatible con el build de Capacitor. Preferir siempre
las APIs nativas del browser (Web Crypto, fetch, etc.).

#### 2. Gradle puede servir assets obsoletos (build incremental)

`npx cap sync android` + `./gradlew assembleDebug` puede ejecutar muy pocos
tasks (ej: "1 executed") y generar un APK con el bundle web anterior.

**Síntoma:** los logs de la app muestran comportamiento viejo aunque el código cambió.

**Diagnóstico:** comparar el nombre del bundle en `dist/assets/` vs
`android/app/src/main/assets/public/assets/`. Si no coinciden, el sync no funcionó.

**Solución:** usar `./gradlew clean assembleDebug` para forzar reconstrucción completa.

#### 3. Inicialización de cifrado en el flujo de onboarding

`AppProvider.coldStart()` llama a `SecurityService().initEncryption()` en el path
normal, pero cuando no hay wallet activa salta directo a `go("ONBOARDING")` sin
inicializar el cifrado. Cuando `WelcomeView` llama a `boot()` → `walletBoot()` →
`WalletManagerService().createWallet()` → `flushDatabase()` → el plugin de cifrado
falla con `"Encryption key not loaded. Call initialize() first"`.

**Solución:** agregar `await SecurityService().initEncryption()` antes de `go("ONBOARDING")`.

#### 4. Leer logcat en dispositivos Android

`adb logcat > /tmp/bolsillo-logcat.log` genera output binario. Para extraer los
logs de la app usar:

```bash
strings /tmp/bolsillo-logcat.log | grep "Capacitor/Console"
```

O directamente filtrar en tiempo real:

```bash
adb logcat | grep "Capacitor/Console"
```

#### 5. Balance con 0-conf en Selene

Selene actualiza el balance con transacciones 0-conf (no confirmadas). Si el
balance no aparece inmediatamente, cerrar y reabrir la app fuerza un refresh del
estado Redux. El cambio de address al recibir un UTXO es comportamiento esperado
(BIP44: rotación de address de recepción).
