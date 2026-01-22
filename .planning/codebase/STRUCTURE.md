# Codebase Structure

**Analysis Date:** 2026-01-22

## Directory Layout

```
selene-wallet/
├── .claude/                     # Claude Code context files
├── .planning/codebase/          # GSD mapping documents (this dir)
├── android/                     # Android native project
├── ios/                         # iOS native project
├── automation/                  # Build/deploy scripts
├── node_modules/                # Dependencies
├── public/                       # Static assets (favicons, manifest)
├── dist/                         # Build output (generated)
├── src/                          # Source code root
│   ├── init.jsx                  # App initialization entry point
│   ├── Main.jsx                  # Root React component (Redux/Router setup)
│   ├── setupTests.js             # Vitest configuration
│   ├── apolloClient.tsx          # Apollo GraphQL client for stats API
│   ├── components/               # React components (presentation layer)
│   │   ├── layout/               # Shell components (MainLayout, BottomNav, ErrorBoundary)
│   │   ├── atoms/                # Atomic UI components (Button, Card, Address, etc.)
│   │   │   └── icons/            # Icon components
│   │   ├── composite/            # Composite components (mid-level UI)
│   │   └── views/                # Page-level components (lazy-loaded routes)
│   │       ├── wallet/           # Wallet operations (home, send, history, vendor)
│   │       ├── assets/           # Token/NFT management
│   │       ├── explore/          # Discovery features (contacts, map)
│   │       ├── settings/         # App configuration, wallet wizard
│   │       ├── apps/             # Integrated apps (blaze, bliss, cauldron, qrgen, etc.)
│   │       ├── debug/            # Debug console and utilities
│   │       └── credits/          # About/credits page
│   ├── redux/                    # Redux state management
│   │   ├── index.ts              # Store setup, initialization phases
│   │   ├── wallet.ts             # Active wallet state
│   │   ├── sync.ts               # Electrum connection & blockchain sync
│   │   ├── preferences.ts        # User settings
│   │   ├── device.ts             # Platform detection, scanner state
│   │   ├── txHistory.ts          # Transaction history
│   │   ├── exchangeRates.ts      # BCH/fiat rates
│   │   ├── walletConnect.ts      # WalletConnect v2 sessions
│   │   └── stats.js              # Metrics/telemetry state
│   ├── services/                 # Domain logic singleton services
│   │   ├── WalletManagerService.ts       # Wallet CRUD, hashing, activation
│   │   ├── DatabaseService.ts            # SQLite management
│   │   ├── HdNodeService.tsx             # BIP39/BIP44 key derivation
│   │   ├── AddressManagerService.ts      # Address derivation
│   │   ├── UtxoManagerService.ts         # UTXO tracking, balance calcs
│   │   ├── TransactionBuilderService.ts  # Build & sign transactions
│   │   ├── TransactionManagerService.ts  # Transaction broadcast, resolution
│   │   ├── ElectrumService.ts            # Electrum protocol WebSocket client
│   │   ├── BlockchainService.ts          # Block storage/retrieval
│   │   ├── AddressScannerService.ts      # Address discovery
│   │   ├── TokenManagerService.ts        # Token/NFT metadata
│   │   ├── BcmrService.tsx               # BCMR metadata resolution
│   │   ├── SecurityService.ts            # PIN/biometric auth
│   │   ├── WalletConnectService.tsx      # WalletConnect v2 integration
│   │   ├── CauldronService.ts            # Cauldron DEX interface
│   │   ├── JanitorService.ts             # File system maintenance
│   │   ├── LogService.ts                 # Logging utility
│   │   ├── ToastService.tsx              # Toast notifications
│   │   ├── CurrencyService.tsx           # Currency conversion
│   │   └── ConsoleService.ts             # Debug console
│   ├── routes/                   # Route definitions (feature-based)
│   │   ├── route.tsx             # Main router (combines all routes)
│   │   ├── routeWallet.tsx       # Wallet feature routes
│   │   ├── routeAssets.tsx       # Token/asset routes
│   │   ├── routeExplore.tsx      # Discovery routes
│   │   ├── routeSettings.tsx     # Settings/wizard routes
│   │   ├── routeApps.tsx         # Integrated apps routes
│   │   └── routeDebug.tsx        # Debug routes
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTokenData.tsx      # Token data fetching
│   │   ├── useCurrencyFlip.tsx   # BCH ↔ fiat conversion
│   │   ├── useClipboard.tsx      # Clipboard copy
│   │   ├── useLongPress.ts       # Long press gesture
│   │   └── ... (others)
│   ├── util/                     # Pure utility functions and constants
│   │   ├── cashaddr.ts           # CashAddr encoding/decoding
│   │   ├── sats.ts               # Satoshi conversion utilities
│   │   ├── currency.ts           # Currency formatting
│   │   ├── hash.ts               # SHA256 hashing
│   │   ├── uri.ts                # BCH URI parsing
│   │   ├── electrum_servers.ts   # Electrum server configs per network
│   │   ├── derivation.ts         # BIP44 derivation paths
│   │   ├── payment_protocol.ts   # BitcoinCash payment protocol
│   │   ├── translations.ts       # i18n helper
│   │   └── ... (others)
│   ├── assets/                   # Static images, icons
│   └── index.css                 # Global styles (Tailwind)
├── index.html                    # HTML entry point
├── vite.config.js                # Vite bundler config
├── capacitor.config.json         # Capacitor platform config
├── package.json                  # Dependencies & scripts
├── .eslintrc.json                # ESLint rules
├── .prettierrc                   # Prettier formatting
└── CLAUDE.md                      # This project's Claude instructions
```

## Directory Purposes

**src/components/layout:**
- Purpose: Shell components for page structure
- Contains: MainLayout (root container), BottomNavigation (tab bar), ErrorBoundary, ViewHeader
- Key files: `MainLayout.jsx` (sets dark mode, platform CSS, handles app lifecycle)

**src/components/atoms:**
- Purpose: Atomic, reusable UI building blocks
- Contains: Button, Card, Address, TokenIcon, NumberFormat, Checkbox, Address display
- Pattern: Single responsibility, composable, highly configurable (props)

**src/components/views:**
- Purpose: Page-level components (route targets)
- Contains: Feature-specific views organized by feature area (wallet, assets, settings, apps)
- Pattern: Lazy-loaded via React Router, manage their own sub-routes (Outlet)

**src/redux:**
- Purpose: Centralized state management
- Contains: Feature slices with reducers, async thunks, selectors
- Pattern: Redux Toolkit; initialization in three phases (PRE_INIT, APP_INIT, POST_INIT)

**src/services:**
- Purpose: Encapsulate domain logic with dependency injection
- Contains: Wallet operations, blockchain communication, database access, integrations
- Pattern: Functions returning objects with methods; services call other services

**src/routes:**
- Purpose: Organize route definitions by feature
- Contains: Feature route arrays merged into main router
- Pattern: Each file exports array of route objects; route.tsx combines them

**src/hooks:**
- Purpose: Reusable stateful React logic
- Contains: Data fetching, gestures, clipboard, currency flipping
- Pattern: Custom hooks for component reuse

**src/util:**
- Purpose: Pure functions and constants
- Contains: Cryptography, address validation, URI parsing, format conversion
- Pattern: No side effects, no dependencies on Redux or services
- Files: Most are .ts (pure logic), some .js (simple constants)

**src/assets:**
- Purpose: Static image and icon files
- Contains: App icons, logos, token icons
- Pattern: Imported into components or referenced in CSS

## Key File Locations

**Entry Points:**
- `src/init.jsx`: App initialization (three-phase init, Capacitor listeners)
- `src/Main.jsx`: Root React component (Redux + Router setup)
- `index.html`: HTML bootstrap

**Configuration:**
- `vite.config.js`: Bundler config with import aliases (@/, @/views, @/atoms, etc.)
- `capacitor.config.json`: Native app config (app name, package ID, plugins)
- `package.json`: Dependencies and npm/pnpm scripts
- `.eslintrc.json`: Linting rules (Airbnb, TypeScript, Prettier)

**Core Logic:**
- `src/services/WalletManagerService.ts`: Wallet CRUD
- `src/services/ElectrumService.ts`: Blockchain communication
- `src/services/TransactionBuilderService.ts`: Transaction construction
- `src/redux/wallet.ts`: Wallet state and async thunks

**Testing:**
- `src/setupTests.js`: Vitest configuration
- `*.test.ts`: Colocated test files (e.g., `cashaddr.test.ts`)

## Naming Conventions

**Files:**
- Components: PascalCase.tsx/.jsx (e.g., WalletView.jsx, Button.tsx)
- Services: PascalCase.ts ending with "Service" (e.g., WalletManagerService.ts)
- Hooks: camelCase.ts prefixed with "use" (e.g., useTokenData.tsx)
- Redux slices: camelCase.ts (e.g., wallet.ts, preferences.ts)
- Utilities: camelCase.ts (e.g., cashaddr.ts, currency.ts)
- Tests: camelCase.test.ts (e.g., sats.test.ts)

**Directories:**
- Feature areas: camelCase (wallet, assets, settings, apps)
- UI layers: atoms, composite, layout, views
- Logic layers: redux, services, util, hooks

**TypeScript Types:**
- Interfaces: PascalCase with "I" suffix optional (e.g., WalletEntity, ButtonProps)
- Enums: PascalCase (e.g., ValidBchNetwork)
- Type aliases: camelCase or PascalCase depending on context

## Where to Add New Code

**New Feature (e.g., send transaction):**
- Route: `src/routes/routeWallet.tsx` (add route path)
- View component: `src/components/views/wallet/send/WalletViewSend.jsx`
- Redux state: Add async thunk to `src/redux/wallet.ts` (if needed)
- Services: Use existing services (TransactionBuilderService, ElectrumService)
- Tests: Colocate `WalletViewSend.test.tsx` next to component

**New Component:**
- Atoms: `src/components/atoms/MyComponent.tsx` (if reusable UI)
- Views: `src/components/views/{feature}/MyView.tsx` (if page-level)
- Composite: `src/components/composite/MyComposite.tsx` (if mid-level)
- Export: Named export (ESLint prefers no default exports, but allowed)

**New Utility Function:**
- Location: `src/util/{domain}.ts` (e.g., util/sats.ts for satoshi helpers)
- Pattern: Pure function, no side effects
- Tests: Colocate {domain}.test.ts with tests

**New Service:**
- Location: `src/services/MyService.ts`
- Pattern: Export default function returning object with methods
- Dependencies: Inject via closure (e.g., const Database = DatabaseService())

## Special Directories

**dist/:**
- Purpose: Build output
- Generated: Yes (via pnpm build)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (via pnpm install)
- Committed: No (in .gitignore)

**.planning/codebase/:**
- Purpose: GSD mapping documents
- Generated: By /gsd:map-codebase command
- Committed: Yes (for team reference)

**ios/ and android/:**
- Purpose: Native platform projects
- Structure: Capacitor framework; generated by npx cap sync
- Custom code: Minimal; platform-specific Capacitor plugin integration
- Build: pnpm build && npx cap sync && npx cap run {ios|android}

## Import Aliases

Configured in `vite.config.js`:
- `@/` → `src/` (root alias, most common)
- `@/layout` → `src/components/layout`
- `@/views` → `src/components/views`
- `@/atoms` → `src/components/atoms`
- `@/icons` → `src/components/atoms/icons`
- `@/apps` → `src/components/views/apps`
- `@/composite` → `src/components/composite`

Usage in imports:
```typescript
import WalletView from "@/views/wallet/WalletView";
import Button from "@/atoms/Button";
import { translate } from "@/util/translations";
import WalletManagerService from "@/services/WalletManagerService";
```

## Database Schema

**AppDatabase (`/selene/db/app.db`):**
- `wallets`: Wallet metadata (walletHash, name, balance, created_at)
- `blocks`: Block header cache
- `bcmr_registries`: BCMR token metadata

**WalletDatabase (`/selene/db/{walletHash}.db`):**
- `wallet`: Single row with mnemonic, balance, address count
- `addresses`: Individual addresses with balance, derivation path
- `utxos`: Unspent transaction outputs with amounts
- `transactions`: Transaction history
- `tokens`: Token balances (CashTokens)

Access via `DatabaseService.getWalletDatabase(walletHash)` (lazy loaded on wallet activation).

## Build and Development

**Development Server:**
```bash
pnpm dev              # Vite dev server at http://localhost:5173
pnpm vitest           # Watch mode tests
```

**Production Build:**
```bash
pnpm build            # Run tests, then build to dist/
pnpm preview          # Preview dist/ locally
```

**Mobile Deployment:**
```bash
pnpm build && npx cap sync                  # Sync web assets to native
npx cap run ios                              # Build and run iOS
npx cap run android                          # Build and run Android
npx cap open ios                             # Open Xcode for manual build
npx cap open android                         # Open Android Studio
```

**Code Quality:**
```bash
pnpm lint             # ESLint + Prettier check
pnpm pretty           # Prettier auto-format
pnpm test             # Run all linting + tests
```
