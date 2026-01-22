# External Integrations

**Analysis Date:** 2026-01-22

## APIs & External Services

**Blockchain Nodes:**
- Electrum Cash Protocol (mainnet, chipnet, testnet3, testnet4) - BCH blockchain data
  - SDK/Client: `@electrum-cash/network` and `@electrum-cash/web-socket`
  - Transport: WebSocket
  - Implementation: `src/services/ElectrumService.ts`
  - Multiple fallback servers configured per network in `src/util/electrum_servers`
  - Connection state managed in Redux `src/redux/sync.ts`

**Cauldron DEX Protocol:**
- Cauldron (decentralized exchange for BCH tokens)
  - SDK: `@cashlab/cauldron` (1.0.2)
  - Implementation: `src/services/CauldronService.ts`
  - Uses Rostrum protocol (variant of Electrum on Cauldron network)
  - Provides: liquidity pools, token swaps, price discovery
  - Queried via `ElectrumService("cauldron")` network instance

**Exchange Rates:**
- CoinGecko API - Primary source for BCH/fiat exchange rates
  - Endpoint: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=...`
  - Implementation: `src/services/CurrencyService.tsx`
  - Supports 60+ currencies
  - Fallback: Yadio API for ARS/VES rates (street rate, not official)

- Yadio API - Secondary source for regional rates (Argentina, Venezuela)
  - Endpoint: `https://api.yadio.io/exrates/USD`
  - Used to calculate ground-level rates for ARS, VES, VEF
  - Implementation: `src/services/CurrencyService.tsx` (in `replaceYadioRates()`)

**Metadata Registries:**
- BCMR (Bitcoin Cash Metadata Registry) Protocol
  - Provider: Paytaca public registry
  - Endpoint: `https://bcmr.paytaca.com/api/registries/{authbase}/latest`
  - Implementation: `src/services/BcmrService.tsx`
  - Purpose: Token/NFT metadata, icons, category information
  - Local BCMR: `src/assets/bcmr-selene-local.json`
  - Data fetched via HTTP with optional IPFS fallback

- IPFS
  - Used for resolving BCMR icon URLs and metadata resources
  - Implementation: `src/util/ipfs.ts`
  - Configurable IPFS gateway support

**Stats & Analytics:**
- Stats API (GraphQL)
  - Server: `https://stats.selene.cash/` (production)
  - Alternative local: `http://localhost:4000/` (development only, commented out)
  - SDK: `@apollo/client` (GraphQL client)
  - Configuration: `src/apolloClient.tsx`
  - Purpose: User engagement metrics (NOT wallet operations)
  - Implementation: `src/redux/stats.js`

## Data Storage

**Databases:**
- SQLite (via sql.js WebAssembly)
  - Storage: Capacitor Filesystem (iOS: Library directory, Android: app files)
  - Files:
    - `/selene/db/app.db` - Shared app data (wallets list, transactions metadata, blocks index)
    - `/selene/db/{walletHash}.db` - Per-wallet data (addresses, UTXOs, tokens, token balances)
  - Implementation: `src/services/DatabaseService.ts`
  - Client: sql.js (1.13.0)
  - Migrations: `src/util/migrations.ts` (schema versioning for app and wallet dbs)

**File Storage:**
- Capacitor Filesystem (local device storage only)
  - Used for:
    - SQLite database files (`/selene/db/`)
    - Raw blockchain blocks (`/selene/blocks/{blockhash}.raw` hex data)
  - Implementation: `src/services/BlockchainService.ts` for blocks
  - Implementation: `src/services/DatabaseService.ts` for databases

**Caching:**
- In-memory caching
  - BCMR icon cache (Map in `BcmrService`)
  - Electrum connection handles (Map in `ElectrumService`)
- Redux state (stores rates, sync status, wallet data)
- No external cache service (Redis, etc.)

## Authentication & Identity

**Auth Provider:**
- Custom PIN/Biometric (no OAuth)
  - PIN authentication: User-set 4-6 digit code
  - Biometric: Fingerprint/Face ID (delegates to OS)
  - Implementation: `src/services/SecurityService.ts`
  - SDK: `@capgo/capacitor-native-biometric` (8.2.0)
  - Storage: Encrypted in native keychain via Capacitor
  - Guard actions: app open, wallet activation, send transaction, etc.

- WalletConnect v2
  - Allows dApps to request signatures without private key exposure
  - SDK: `@walletconnect/core` (2.23.1), `@reown/walletkit` (1.4.1)
  - Project ID: `953f3fbfdc425848d3d9693a6c927cda`
  - Implementation: `src/services/WalletConnectService.tsx`
  - Metadata: Name, description, icon URL to identify Selene to dApps

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Bugsnag, etc.)

**Logs:**
- Custom logging service: `src/services/LogService.ts` and `src/services/ConsoleService.ts`
- Wraps js-logger (1.6.1)
- Console output for development (browser DevTools, mobile app logs)
- Can be routed via `LogService()` calls throughout codebase

## CI/CD & Deployment

**Hosting:**
- Web: Vite SPA served at `https://app.selene.cash`
- iOS: App Store
- Android: Google Play
- Native build via Capacitor

**CI Pipeline:**
- GitLab CI (`.gitlab-ci.yml`)
- Test runner: Vitest
- Linter: ESLint + Prettier
- Build: Vite (outputs to `dist/`)
- No deployment automation detected in analysis (manual or separate pipeline)

## Environment Configuration

**Required env vars:**
- `ANDROID_KEYSTORE` - Path to Android signing keystore (release builds)
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias in keystore
- `ANDROID_KEY_PASSWORD` - Key password
- `SPACESHIP_2FA_SMS_DEFAULT_PHONE_NUMBER` - Fastlane 2FA phone number
- `GOOGLE_TRANSLATE_API_KEY` - Google Translate API key (for automation/addLanguages.js script)

**Secrets location:**
- `.env` file (not checked into git, uses `.env.dist` as template)
- Android keystore: Referenced via env var, stored outside repo
- Capacitor preferences: Native device keychain (via `@capacitor/preferences`)

## Webhooks & Callbacks

**Incoming:**
- Electrum subscriptions:
  - `address.subscribe()` - UTXO change notifications
  - `blockchain.headers.subscribe()` - New block headers
  - Implementation: `src/services/ElectrumService.ts`
  - Handled via Redux sync dispatch

- WalletConnect session requests:
  - `session_proposal` - dApp connects and requests wallet access
  - `session_request` - dApp requests transaction signature
  - `session_delete` - dApp disconnects
  - Implementation: `src/services/WalletConnectService.tsx`

- App lifecycle hooks (Capacitor):
  - `App.addListener("pause", ...)` - App backgrounded → pause sync
  - `App.addListener("resume", ...)` - App foregrounded → resume sync
  - `App.addListener("appUrlOpen", ...)` - Deep link via `bch://` URI scheme
  - Implementation: `src/init.jsx`

**Outgoing:**
- Electrum broadcast:
  - `broadcastTransaction()` to Electrum server
  - Implementation: `src/services/ElectrumService.ts`

- CoinGecko/Yadio HTTP requests:
  - `fetch()` for exchange rates (no webhooks, polling only)

- BCMR HTTP requests:
  - `fetch()` for metadata registries (no webhooks)

- WalletConnect responses:
  - Approvals, rejections, and method responses sent back to dApps
  - Implementation: `src/services/WalletConnectService.tsx`

---

*Integration audit: 2026-01-22*
