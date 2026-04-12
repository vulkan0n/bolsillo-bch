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

## Estado del fork (2026-04-12)

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

### Cambios realizados
- Logo reemplazado: `src/assets/selene-logo.svg`
- Tab "Explore" eliminada de la navegación (`src/components/layout/BottomNavigation.tsx`)

### Próximos pasos pendientes
- Modo comerciante: pantalla de cobro con monto en ARS → QR BCH
- Denominación dual ARS + BCH en la vista de balance
- Onboarding progresivo (simplificar el flujo de las 12 palabras)
- Cambiar nombre/branding de "Selene" a "Bolsillo BCH" en la UI
