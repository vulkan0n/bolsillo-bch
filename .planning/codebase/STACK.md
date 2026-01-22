# Technology Stack

**Analysis Date:** 2026-01-22

## Languages

**Primary:**
- JavaScript/JSX - React components, Redux configuration, utilities
- TypeScript - Type-safe services, Redux slices, utilities (gradual migration in progress)

**Secondary:**
- CSS/Tailwind - Styling via Tailwind CSS
- SQL - SQLite schema and migrations in `src/util/migrations`

## Runtime

**Environment:**
- Node.js (no specific version pinned, uses pnpm)

**Package Manager:**
- pnpm 10.27.0 (enforced via preinstall hook)
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- React 19.2.3 - UI framework
- React Router 7.11.0 - Client-side routing with lazy loading
- Redux Toolkit 2.11.2 - State management (6 feature slices in `src/redux/`)

**Mobile/Native:**
- Capacitor 8.0.0 - Cross-platform mobile bridge (iOS, Android, Web)
  - Official plugins: filesystem, camera, preferences, device, dialog, keyboard, network, clipboard, haptics, splash screen, app, share, inappbrowser, screen-orientation
  - Community plugins: native-biometric (8.2.0), keep-awake (8.0.0), torch (8.0.0)
- Capacitor iOS 8.0.0
- Capacitor Android 8.0.0

**Build/Dev:**
- Vite 5.4.21 - Build tool and dev server
- Vitest 4.0.17 - Test runner
- Prettier 3.7.4 - Code formatter
- ESLint 8.57.1 with TypeScript support - Linting

## Key Dependencies

**Cryptography & Wallet:**
- @bitauth/libauth 3.0.0 - Bitcoin Cash cryptography, key derivation (BIP39/BIP44), signing
- bip39 3.1.0 - BIP39 mnemonic handling
- decimal.js 10.6.0 - Precise decimal arithmetic for financial calculations

**Blockchain:**
- @electrum-cash/network 4.1.4 - Electrum protocol client (WebSocket)
- @electrum-cash/web-socket 1.0.3 - WebSocket transport for Electrum

**Database:**
- sql.js 1.13.0 - SQLite compiled to WebAssembly (runs in browser/app)

**DeFi & Integrations:**
- @cashlab/cauldron 1.0.2 - Cauldron DEX integration (liquidity pools, swaps)
- @cashlab/common 1.0.4 - Shared types for Cauldron
- @walletconnect/core 2.23.1 - WalletConnect v2 core protocol
- @walletconnect/utils 2.23.1 - WalletConnect utilities
- @walletconnect/jsonrpc-utils 1.0.8 - JSON-RPC utilities
- @reown/walletkit 1.4.1 - WalletConnect SDK for wallet implementations

**Data & Metadata:**
- @apollo/client 3.14.0 - GraphQL client for stats API
- @bitauth/libauth - BCMR (Bitcoin Cash Metadata Registry) parsing
- graphql 16.12.0 - GraphQL core library

**UI Components:**
- react-dom 19.2.3 - React DOM rendering
- @ant-design/icons 5.6.1 - Ant Design icon library
- react-hot-toast 2.6.0 - Toast notifications
- react-vertical-timeline-component 3.6.0 - Timeline visualization
- react-chartjs-2 5.3.1 - Chart rendering
- chart.js 4.5.1 - Chart library
- react-player 2.16.1 - Media player
- react-qrcode-logo 3.0.0 - QR code generation
- react-leaflet 4.2.1 - Map library (React wrapper)
- leaflet 1.9.4 - Leaflet mapping library

**QR & Scanning:**
- qr-scanner 1.4.2 - QR code scanning from camera

**Data Format & Utilities:**
- luxon 3.7.2 - Date/time handling
- jspdf 3.0.4 - PDF generation
- react-spring/web 10.0.3 - Animation library
- @use-gesture/react 10.3.1 - Gesture handling
- prop-types 15.8.1 - Runtime prop validation
- js-logger 1.6.1 - Logging utility

## Configuration

**Environment:**
- Configuration via `.env` (see `.env.dist` for required variables)
- Required env vars:
  - `ANDROID_KEYSTORE` - Android release signing
  - `ANDROID_KEYSTORE_PASSWORD` - Android keystore password
  - `ANDROID_KEY_ALIAS` - Android key alias
  - `ANDROID_KEY_PASSWORD` - Android key password
  - `SPACESHIP_2FA_SMS_DEFAULT_PHONE_NUMBER` - Fastlane 2FA
  - `GOOGLE_TRANSLATE_API_KEY` - Google Translate API (for automated translation script)

**Build:**
- `vite.config.js` - Vite configuration with React plugin, node polyfills, top-level await
- `tsconfig.json` - TypeScript compiler options with path aliases
- `capacitor.config.json` - Capacitor mobile app configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `postcss.config.cjs` - PostCSS configuration
- `.eslintrc.json` - ESLint rules and extends
- `.prettierrc` - Prettier formatting rules

## Platform Requirements

**Development:**
- macOS (development machine has darwin 25.2.0)
- iOS SDK (for `pnpm build && npx cap sync && npx cap run ios`)
- Android SDK (for `pnpm build && npx cap sync && npx cap run android`)

**Production:**
- Deployed as Capacitor app to iOS App Store and Google Play
- Web deployment: `https://app.selene.cash` (via Vite build output)
- Build command: `pnpm build` (runs linting and tests first)

## Plugin Ecosystem

**Visualization:**
- rollup-plugin-visualizer 5.14.0 - Bundle size analysis (generates `stats.html`)

**Polyfills:**
- vite-plugin-node-polyfills 0.24.0 - Node.js API polyfills (fs, path, crypto, stream, vm for sql.js)
- vite-plugin-top-level-await 1.6.0 - Top-level await support in older browsers

**React:**
- @vitejs/plugin-react 4.7.0 - Vite React plugin with Fast Refresh
- react-refresh - Hot module replacement for React

**Testing:**
- @testing-library/react 14.3.1 - React testing utilities
- @testing-library/jest-dom 6.9.1 - Custom matchers for DOM assertions

---

*Stack analysis: 2026-01-22*
