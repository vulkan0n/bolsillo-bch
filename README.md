# Bolsillo BCH

Wallet BCH simplificada para usuarios argentinos. Fork de [Selene Wallet](https://selene.cash).

**Bolsillo** es una billetera de Bitcoin Cash pensada para usuarios que **no son cripto-entusiastas**: onboarding progresivo, backup automático en Google Drive, denominación en ARS, y una interfaz minimalista sin ruido técnico.

---

## Diferencias con Selene Wallet

| Aspecto | Selene | Bolsillo BCH |
|---------|--------|--------------|
| Usuario target | Cripto-usuario global | Comercios argentinos |
| Idioma default | Inglés | Español (`es`) |
| Moneda default | USD | ARS |
| Onboarding | Seed visible | Google Drive backup automático |
| Settings | 9 secciones | 4 esenciales + modo experto oculto |
| Recuperación | Solo PIN/biométrico | Pregunta de seguridad + PIN |
| Home | Balance simple | Balance dual ARS (grande) + BCH |
| Navegación | 4-5 tabs | 3 tabs (Inicio/Movimientos/Ajustes) |
| Branding | Selene | Bolsillo BCH |

---

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 5** — Build tooling
- **Capacitor 8** — Cross-platform native bridge (iOS, Android, Web)
- **Redux Toolkit** — State management
- **Tailwind CSS** — Styling
- **sql.js** — SQLite WASM for encrypted local storage
- **libauth** — BCH cryptography and transaction building
- **Electrum protocol** — Blockchain communication over WebSocket

---

## Developer Quick Start

```bash
pnpm install
pnpm dev
open http://localhost:5173
```

### Building for Android

```bash
pnpm build:ci && npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Para deployar a un celular por USB/Wi-Fi:
```bash
./scripts/deploy-android.sh
```

### Building for iOS

```bash
pnpm build && npx cap sync
npx cap run ios
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/       # MainLayout, BottomNavigation, ErrorBoundary
│   ├── atoms/        # Button, Card, Address, TokenIcon, Satoshi
│   ├── composite/    # TokenCard, modals
│   └── views/        # Page-level views (lazy-loaded)
├── kernel/
│   ├── app/          # AppProvider, DatabaseService, SecurityService
│   ├── bch/          # ElectrumService, TransactionBuilderService
│   └── wallet/       # KeyManagerService, WalletManagerService, UtxoManagerService
├── redux/            # Redux Toolkit slices
├── hooks/            # Custom hooks
├── util/             # Pure utilities, formatting, validation
└── routes/           # Route definitions
```

---

## Acknowledgments

Este proyecto es un fork de [Selene Wallet](https://selene.cash) (`BSD-3 License`), desarrollada por Kallisti.cash y The Bitcoin Cash Podcast. Todo el crédito de la arquitectura de protocolo BCH, el sistema de cifrado, y las bases de la app les pertenece.

Las modificaciones de Bolsillo BCH se limitan a la capa de UX/presentación y servicios de backup/recuperación.

---

## License

BSD-3 (misma que Selene Wallet)
