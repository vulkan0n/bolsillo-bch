# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Selene Wallet is a self-custodial Bitcoin Cash (BCH) wallet built with React 19, Vite 5, and Capacitor 8 for cross-platform mobile deployment. Uses SQLite (sql.js) for storage, Electrum protocol over WebSocket for blockchain communication.

- **Repository:** https://git.xulu.tech/selene.cash/selene-wallet
- **Website:** https://selene.cash
- **Docs:** https://docs.selene.cash

## Commands

```bash
# Development
pnpm install          # Install deps (pnpm enforced)
pnpm dev              # Dev server at localhost:5173
pnpm lint             # Prettier + ESLint
pnpm pretty           # Auto-format
pnpm test             # Lint + Vitest
pnpm vitest           # Tests in watch mode
pnpm build            # Production build

# Mobile
pnpm build && npx cap sync && npx cap run ios
pnpm build && npx cap sync && npx cap run android
npx cap open ios      # Open Xcode
npx cap open android  # Open Android Studio

# GitLab
glab issue view <n> --repo selene.cash/selene-wallet
glab mr view <n> --repo selene.cash/selene-wallet
./scripts/gitlab-sync.sh       # Refresh .claude/gitlab-state.md
./scripts/gitlab-close-issue.sh <n>  # Close issue with commit ref
```

## Architecture

### Three-Phase Initialization

```
PRE_INIT: JanitorService.fsck() → DatabaseService.initAppDatabase() → redux_pre_init()
APP_INIT: Capacitor listeners → redux_init() → render(<Main />)
POST_INIT: SplashScreen.hide() → BcmrService.preloadMetadataRegistries()
```

### State Management (Redux Toolkit)

Slices in `src/redux/`:
- **wallet.ts** - Active wallet, balances, addresses, UTXOs
- **sync.ts** - Electrum connection, blockchain sync status
- **preferences.ts** - User settings (theme, currency, language, network)
- **device.ts** - Platform info, scanner state, network status
- **txHistory.ts** - Transaction history with filtering
- **exchangeRates.ts** - BCH/fiat rates
- **walletConnect.ts** - WalletConnect v2 sessions

### Services (src/services/)

Singleton pattern with dependency injection:

| Service | Purpose |
|---------|---------|
| WalletManagerService | Wallet CRUD, hashing, activation |
| DatabaseService | SQLite management (sql.js) |
| HdNodeService | BIP39/BIP44 key derivation (@bitauth/libauth) |
| AddressManagerService | Address derivation |
| UtxoManagerService | UTXO tracking, balance calculations |
| TransactionBuilderService | Build BCH transactions |
| TransactionManagerService | Broadcast, resolution |
| ElectrumService | Electrum WebSocket client |
| SecurityService | PIN/biometric auth |
| BcmrService | Token metadata (BCMR) |
| WalletConnectService | WalletConnect v2 |
| CauldronService | Cauldron DEX |

### Transaction Flow

```
User initiates send
  → TransactionBuilderService.buildTransaction() (UTXO selection, fees)
  → HdNodeService.signInputs() (key derivation, signing)
  → ElectrumService.broadcastTransaction()
  → TransactionManagerService.resolveTransaction() (poll confirmation)
```

### Storage

```
/selene/db/app.db              # Shared: wallets, blocks, bcmr_registries
/selene/db/{walletHash}.db     # Per-wallet: addresses, utxos, tokens, transactions
/selene/blocks/{blockhash}.raw # Raw block hex
```

### Component Organization

```
src/components/
├── layout/     # MainLayout, BottomNavigation, ViewHeader, ErrorBoundary
├── atoms/      # Button, Card, Address, TokenIcon, etc.
├── composite/  # Mid-level UI components
└── views/      # Page-level (lazy-loaded)
    ├── wallet/   # home, send, history
    ├── assets/   # Token/NFT management
    ├── explore/  # contacts, map
    ├── settings/ # configuration, wallet wizard
    └── apps/     # blaze, bliss, cauldron, walletconnect
```

### Import Aliases (vite.config.js)

- `@/` → `src/`
- `@/layout` → `src/components/layout`
- `@/views` → `src/components/views`
- `@/atoms` → `src/components/atoms`
- `@/icons` → `src/components/atoms/icons`
- `@/apps` → `src/components/views/apps`

## Code Conventions

### Naming

- **Files:** PascalCase for components/services, camelCase for utils/redux
- **Functions:** camelCase (`satsToBch`, `validateBip21Uri`)
- **Variables:** camelCase; UPPER_CASE for constants
- **Booleans:** Must prefix with `is`, `should`, `has`, `can`, `did`, `will`
- **Types:** StrictPascalCase (`WalletEntity`, `ButtonProps`)
- **Private members:** Leading underscore (`_database`)

### Formatting

- Prettier enforced (80 char width, 2 spaces, double quotes, semicolons)
- ESLint: Airbnb + TypeScript + Prettier

### Patterns

```typescript
// Named functions in useEffect (ESLint requirement)
useEffect(function handleWalletSync() {
  // ...
}, [dependency]);

// Service singleton pattern
export default function MyService() {
  const Database = DatabaseService();
  return {
    doSomething() { /* ... */ },
  };
}

// Redux pattern
const wallet = useSelector(selectWallet);
const dispatch = useDispatch();
dispatch(someAction(payload));

// Translation pattern
import { translate } from "@/util/translations";
import translations from "./translations";
{translate(translations.keyName)}
```

### Route Pattern (Lazy Loading)

```typescript
{
  path: "/apps/myapp",
  async lazy() {
    const { default: MyAppView } = await import("@/views/apps/myapp/MyAppView");
    return { Component: MyAppView };
  },
}
```

## Translation System

Translations colocated in component files as `const translations = {...}`.

- Add only English (`en`) key initially
- Run `GOOGLE_TRANSLATE_API_KEY="xxx" node ./automation/addLanguages.js` for other languages
- **Constraints:** No `:` or `'` in strings (use `-` and backtick)
- **Bug:** WalletViewSend "notEnoughFee" key - save/restore manually when running script

## Testing

**Framework:** Vitest (colocated test files: `*.test.ts`)

**What's testable:**
- Pure utilities in `src/util/` (sats.ts, cashaddr.ts, uri.ts)
- Validation functions

**What's hard to test:**
- Service layer (tightly coupled to IO)
- Pure algorithms inside services not exported

**Type inconsistency across boundaries:**
| Field | Electrum | SQLite | libauth |
|-------|----------|--------|---------|
| txid | `tx_hash` | `txid` | - |
| amount | `value` (number) | `amount` (bigint) | `valueSatoshis` (bigint) |

## Contributing

1. Base branches off `staging` (NOT main)
2. Branch naming: `###-short-description` (e.g., `446-persist-memos`)
3. Minimize changes to only what's required
4. Self-review diff before submitting
5. Package installation = separate commit
6. Use pnpm (enforced)

**MR Target: Always `staging`, never `main`**

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @bitauth/libauth | 3.0.0 | BCH cryptography |
| @electrum-cash/network | 4.1.4 | Electrum protocol |
| sql.js | 1.13.0 | SQLite WASM |
| @walletconnect/core | 2.23.1 | WalletConnect v2 |
| @cashlab/cauldron | 1.0.2 | Cauldron DEX |

## External Integrations

- **Electrum:** WebSocket to multiple servers per network (mainnet, chipnet, testnet3/4)
- **Exchange Rates:** CoinGecko (primary), Yadio (ARS/VES fallback)
- **BCMR:** Paytaca registry (`https://bcmr.paytaca.com/api/registries/{authbase}/latest`)
- **Stats API:** GraphQL at `https://stats.selene.cash/`
- **WalletConnect:** Project ID `953f3fbfdc425848d3d9693a6c927cda`

## Network Prefixes

- **Mainnet:** `bitcoincash:` prefix
- **Chipnet/Testnet:** `bchtest:` prefix

## Known Issues & Tech Debt

### Security (Address Before Production)

1. **Unsalted PIN hash** - `SecurityService.ts:127` - vulnerable to rainbow tables
2. **Seed in memory** - `HdNodeService.tsx:32-47` - never cleared
3. **Private keys logged** - `HdNodeService.tsx:160` - signatures to console
4. **Unencrypted databases** - Seed phrases in plaintext SQLite

### Tech Debt

- Type inconsistencies across Electrum/SQLite/libauth boundaries
- Merkle proof validation not implemented (trusts Electrum server)
- No transaction fee calculation in history
- Exchange rates not cached per-block
- Large components: WalletViewSend (1038 lines), TransactionBuilderService (937 lines)

### Fragile Areas

- Address scanning sequential (should be parallel)
- BCMR loading blocks sync
- Full history fetch on wallet activation (no pagination)
- Database not indexed

## GitLab Automation

Session start hook runs `./scripts/gitlab-sync.sh` to refresh `.claude/gitlab-state.md`.

**Commands:**
- "sync gitlab" → Run `./scripts/gitlab-sync.sh`
- "what should I work on?" → Read `.claude/priorities.md`
- "close #X" → Run `./scripts/gitlab-close-issue.sh X`

## Lessons Learned

### Capacitor Plugin Naming

Not all plugins are official. Verify before installing:
- Official: `@capacitor/screen-orientation`
- Community: `@capacitor-community/keep-awake` (NOT `@capacitor/keep-awake`)

Always run `npm view @capacitor/plugin-name` first.

### Where Claude Excels

- UI tweaks, CSS fixes
- Config changes, search/filter logic
- CRUD operations, form validation
- Test generation, date formatting

### Where Claude Helps (with oversight)

- Transaction building, balance calculations
- API integrations, caching logic
- Navigation/routing, protocol parsing

### Where Human Must Lead

- Security architecture, key management
- Database migrations, app lifecycle
- Major features, protocol implementations
