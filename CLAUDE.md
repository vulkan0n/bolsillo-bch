# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Selene Wallet is a self-custodial Bitcoin Cash (BCH) wallet built with React, Vite, and Capacitor for cross-platform mobile deployment (iOS, Android, and Web). The wallet uses local SQLite databases for storage, communicates with Electrum servers via WebSocket (electrum-cash/network library), and integrates with various BCH ecosystem apps.

Repository: https://git.xulu.tech/selene.cash/selene-wallet
Website: https://selene.cash
Documentation: https://docs.selene.cash

## Development Commands

### Setup
```bash
pnpm install          # Install dependencies (pnpm is enforced via preinstall hook)
```

### Development
```bash
pnpm dev              # Start Vite dev server at http://localhost:5173
pnpm lint             # Run Prettier + ESLint checks
pnpm pretty           # Auto-format with Prettier
pnpm test             # Run linter + Vitest tests
pnpm vitest           # Run tests in watch mode
pnpm build            # Build production bundle (runs tests first)
pnpm preview          # Preview production build locally
```

### Mobile Development
```bash
# Android
pnpm build && npx cap sync && npx cap run android
npx cap open android  # Open in Android Studio

# iOS
pnpm build && npx cap sync && npx cap run ios
npx cap open ios      # Open in Xcode
```


## High-Level Architecture

### State Management (Redux Toolkit)

Redux is the central state manager with feature slices in `/src/redux/`:

- **wallet.ts**: Active wallet data, balances, addresses, UTXOs
- **preferences.ts**: User settings (theme, currency, language, security preferences)
- **sync.ts**: Electrum connection state, blockchain sync status
- **device.ts**: Device info, platform detection, scanner state, network status
- **txHistory.ts**: Transaction history with filtering/sorting
- **exchangeRates.ts**: BCH/fiat exchange rates
- **walletConnect.ts**: WalletConnect session management

Redux initialization happens in three phases:
1. **PRE_INIT** (`redux_pre_init`): File system, database, wallet recovery
2. **APP_INIT** (`redux_init`): Redux setup, UI rendering
3. **POST_INIT** (`redux_post_init`): Async operations (metadata preload, sync start)

### Services Layer

Services are singletons in `/src/services/` that encapsulate domain logic using dependency injection pattern:

**Core Wallet Services:**
- **WalletManagerService**: Wallet CRUD, hashing, activation
- **DatabaseService**: SQLite management (via sql.js)
- **HdNodeService**: BIP39/BIP44 HD wallet key derivation (uses @bitauth/libauth)
- **AddressManagerService**: Address derivation and management
- **UtxoManagerService**: UTXO tracking and balance calculations
- **TransactionBuilderService**: Constructs BCH transactions
- **TransactionManagerService**: Transaction resolution, signing, broadcasting
- **SecurityService**: PIN/biometric authentication

**Network Services:**
- **ElectrumService**: Electrum protocol client (WebSocket connections)
- **BlockchainService**: Block storage/retrieval on filesystem

**Integration Services:**
- **WalletConnectService**: WalletConnect v2 integration
- **CauldronService**: Cauldron DEX interface
- **BcmrService**: BCMR metadata resolution for tokens
- **TokenManagerService**: Token/NFT metadata and balances

### Transaction Flow

```
User initiates send
  → TransactionBuilderService.buildTransaction() (selects UTXOs, calculates fees)
  → HdNodeService.signInputs() (derives keys, signs with @bitauth/libauth)
  → ElectrumService.broadcastTransaction() (sends to Electrum server)
  → TransactionManagerService.resolveTransaction() (polls for confirmation)
```

### Storage Architecture

```
/selene/db/app.db              # SQLite: shared app data (wallets, transactions, blocks)
/selene/db/{walletHash}.db     # SQLite: per-wallet data (addresses, UTXOs, tokens)
/selene/blocks/{blockhash}.raw # Raw block hex stored on filesystem
```

### Component Organization

```
src/components/
├── layout/              # Shell components (MainLayout, BottomNavigation, ViewHeader)
├── views/               # Page-level components (lazy-loaded routes)
│   ├── wallet/          # Wallet operations (home, send, history)
│   ├── assets/          # Token/NFT management
│   ├── explore/         # Discovery features (contacts, map)
│   ├── settings/        # App configuration, wallet creation/import
│   └── apps/            # Integrated apps (blaze, bliss, cauldron, walletconnect)
└── atoms/               # Reusable UI components (Button, Card, Address, etc.)
```

### Routing

Routes are defined in `/src/routes/route*.tsx` with lazy loading for code splitting. Main app flow: `init.jsx` → `Main.jsx` → `RouterProvider` → `MainLayout` → route outlets.

### Native Integration (Capacitor)

Key Capacitor plugins used:
- **@capacitor/filesystem**: File storage for databases and blocks
- **@capacitor/camera**: QR code scanning
- **@capacitor/preferences**: Key-value persistent storage
- **@capgo/capacitor-native-biometric**: Fingerprint/Face ID authentication
- **@capacitor/app**: App lifecycle hooks and URL scheme handling (bch://)

App lifecycle hooks in `src/init.jsx`:
- `App.addListener("pause", app_pause)` → dispatches `syncPause()`
- `App.addListener("resume", app_resume)` → dispatches `syncResume()`
- `App.addListener("appUrlOpen", handler)` → handles `bch://` payment URIs

### Network Architecture

**Electrum Cash Protocol**: WebSocket connections to Electrum servers for blockchain data. Multiple servers configured per network (mainnet, chipnet, testnet3, testnet4, cauldron). Connection managed via `@electrum-cash/network` with auto-reconnect and failover.

**GraphQL (Apollo)**: Stats API at `https://stats.selene.cash/` for user engagement metrics (not wallet operations). Client configured in `src/apolloClient.tsx`.

## Code Style Guidelines

### ESLint Configuration

- **Extends**: Airbnb base/React, TypeScript, Prettier
- **Ignored patterns**: `*.test.*`, `setupTests.js`, `translations.js`, `**/apps/*`
- **Key rules**:
  - Boolean variables must start with `is`, `should`, `has`, `can`, `did`, `will`
  - Naming convention: strictCamelCase, StrictPascalCase, or snake_case
  - Private class members must have leading underscore
  - No default exports preferred (but allowed)
  - React imports not required in JSX files
  - Named functions required for useEffect hooks

### TypeScript Usage

Use TypeScript type annotations where possible. The codebase is gradually migrating from JavaScript to TypeScript.

### Component Patterns

```jsx
// Named functions in useEffect (required by ESLint)
useEffect(function handleWalletSync() {
  // ...
}, [dependency]);
```

### Import Aliases

Configured in `vite.config.js`:
- `@/` → `src/`
- `@/layout` → `src/components/layout`
- `@/views` → `src/components/views`
- `@/atoms` → `src/components/atoms`
- `@/icons` → `src/components/atoms/icons`
- `@/apps` → `src/components/views/apps`

## Translation System

Translations are colocated with components in files starting with `const translations = {`.

- ⚠️ Translation script costs money! (Google API)

**Auto-translation workflow:**
1. Define English strings in translation files
2. Run `GOOGLE_TRANSLATE_API_KEY="xxx" node ./automation/addLanguages.js`
3. Script scans `src/` for translation files and auto-translates to all supported languages
4. Output is alphabetically sorted by language key

**Note**: Translation files cannot include `:` or `'` in string values. Use `-` instead of `:` and backtick instead of apostrophe.

**Bug**: There is a known issue with WalletViewSend translations and the "notEnoughFee" key. Manually save/restore this key when running the translation script.

## Contributing Guidelines

### Branch Workflow

1. Base new branches off `staging` (NOT main)
2. Use naming format: `###-short-description` (e.g., `446-persist-memos`)
3. Contact Kallisti before starting work to validate scope
4. Open Merge Request with Kallisti as reviewer when ready

### Code Review Expectations

- Minimize changes to only what's required for the ticket
- Include screenshots/video of UI changes
- Self-review the diff before submitting
- Be able to explain "why" for every line of code
- Large MRs will likely be rejected

### Package Management

- **Minimize new dependencies** - only add if strictly necessary
- Research packages thoroughly before installing
- Prioritize minimal footprint (measured in KB, not MB)
- Package installation must be its own commit
- Use pnpm (enforced via preinstall hook)

### Side Effects

- Prefer pure functions unless side effects are necessary
- Avoid top-level scope unless strictly necessary

## Important Architectural Notes

### Sync Architecture

ElectrumService maintains WebSocket connections with exponential backoff retry. Address subscriptions (`address.subscribe()`) notify Redux of UTXO changes. Blockchain header subscriptions (`blockchain.headers.subscribe()`) track new blocks.

### Database Lazy Loading

Wallet databases are opened lazily on wallet activation, not on app boot. This improves startup performance.

### Build Output Analysis

`rollup-plugin-visualizer` generates `stats.html` on build for bundle size analysis.

### Testing Architecture

**Test framework:** Vitest (configured in `vite.config.js`, setup in `src/setupTests.js`)

**What's easily testable:**
- Pure utility functions in `src/util/` (sats.ts, cashaddr.ts, uri.ts, etc.)
- Validation functions (e.g., `validatePreferences` in redux/preferences.ts)

**What's hard to test (tightly coupled to IO):**
- Service layer functions - they mix pure logic with database queries and external APIs
- Pure algorithms exist inside services but aren't exported (e.g., `targetUtxos` in UtxoManagerService, BIP69 sort functions in TransactionBuilderService)

**Known type inconsistency issue:** UTXO/token types differ across boundaries:
| Field | Electrum API | SQLite | libauth |
|-------|--------------|--------|---------|
| txid | `tx_hash` | `txid` | - |
| amount | `value` (number) | `amount` (bigint) | `valueSatoshis` (bigint) |
| token amount | `token_data.amount` (string) | `token_amount` (bigint) | `token.amount` (bigint) |

This blocks clean extraction of pure functions for testing. Future refactor: define canonical types in `src/core/types.ts` with transform functions at boundaries.

### Network Prefixes

- **Mainnet:** `bitcoincash:` prefix
- **Chipnet/Testnet:** `bchtest:` prefix

This matters for address validation and test data - don't use mainnet addresses in chipnet tests.

## Development Tips

### Running Selene Server Locally

The production stats server at `https://stats.selene.cash/` works for most purposes. To run locally:
1. Clone [selene-server](https://git.xulu.tech/selene.cash/selene-server)
2. Update server URL in `src/apolloClient.tsx`

### Testing on Mobile

For iOS/Android testing, always run `pnpm build && npx cap sync` before deploying to ensure native app has latest web assets.


## 🎯 Claude Workflow

### Development Pattern
1. **Investigate:** Use `glab issue view` + `open` to see screenshots/details
2. **Explore:** Use Task tool with Explore agent for codebase discovery
3. **Implement:** Make focused changes (Edit/Write tools)
4. **Test:** User tests locally with `pnpm dev`
5. **Track:** Use TodoWrite to track progress

### Code Review Standards (from CONTRIBUTING.md)
- Minimize changes to only what's required
- Self-review diffs before submitting
- Include screenshots/video of UI changes
- Be able to explain "why" for every line

## 📊 Repository Context

### GitLab Setup
- **Repository:** https://git.xulu.tech/selene.cash/selene-wallet
- **GitLab CLI:** `glab` configured and working
- **Total Open Issues:** ~283 issues (see .claude/gitlab-state.md for current count)
- **Issue Tracker:** https://git.xulu.tech/selene.cash/selene-wallet/-/issues
- **Milestones:** https://git.xulu.tech/selene.cash/selene-wallet/-/milestones


### Key GitLab Commands
```bash
# View issue
glab issue view <number> --repo selene.cash/selene-wallet

# View MR
glab mr view <number> --repo selene.cash/selene-wallet

# List issues
glab issue list --repo selene.cash/selene-wallet --per-page 100

# Open issue in browser
open "https://git.xulu.tech/selene.cash/selene-wallet/-/issues/<number>"

# Get issue data via API
glab api 'projects/selene.cash%2Fselene-wallet/issues?state=opened&per_page=100'
```

### GitLab Sync Scripts

The following scripts automatically sync GitLab state:

```bash
# Refresh GitLab state (issues, milestones, priorities)
./scripts/gitlab-sync.sh

# Compute priority rankings
./scripts/gitlab-priorities.sh

# Close an issue with commit reference
./scripts/gitlab-close-issue.sh <issue_number>
```

### GitLab State Files

Located in `.claude/`:
- **gitlab-state.md** - Current snapshot of open issues, milestones, bugs
- **priorities.md** - Computed priority rankings
- **velocity.json** - Tracks issue completion velocity over time

### GitLab Automation Patterns

**Automation Mode: Confirm First** - Always confirm before executing GitLab actions.

When user says:
- **"issue #X is done"** or **"#X is complete"** - Offer to close issue with commit link:
  ```
  Close #X with commit reference? This will:
  1. Add a comment linking to the current commit
  2. Close the issue
  [Run: ./scripts/gitlab-close-issue.sh X]
  ```

- **"close #X"** - Show confirmation before closing (use gitlab-close-issue.sh)

- **"working on #X"** - Acknowledge and reference the issue context

- **"what should I work on?"** - Read `.claude/priorities.md` and provide recommendations based on:
  - Critical issues first
  - Overdue milestone items
  - Quick wins for momentum
  - Velocity data (if available)

- **"sync gitlab"** or **"refresh gitlab"** - Run `./scripts/gitlab-sync.sh` to refresh gitlab-state.md

### Session Start Hook

A hook automatically runs `./scripts/gitlab-sync.sh` when Claude Code sessions start (configured in `.claude/settings.local.json`). This ensures `.claude/gitlab-state.md` is current.

## 📝 Critical Code Patterns

### Translation Pattern
```javascript
// In component file
import { translate } from "@/util/translations";
import translations from "./translations";

// Usage
{translate(translations.keyName)}

// In translations.js file
const translations = {
  keyName: {
    en: "English text",
    es: "Spanish text",
    // ... more languages auto-generated
  },
};
```

### Redux Pattern
```typescript
// In component
import { useDispatch, useSelector } from "react-redux";
import { selectWallet } from "@/redux/wallet";
import { someAction } from "@/redux/wallet";

const wallet = useSelector(selectWallet);
const dispatch = useDispatch();
dispatch(someAction(payload));
```

### Service Pattern
```typescript
// Services are functions returning objects
export default function MyService() {
  const Database = DatabaseService(); // Dependency injection

  return {
    doSomething() {
      // Implementation
    },
  };
}

// Usage
const service = MyService();
service.doSomething();
```

### Route Pattern (Lazy Loading)
```typescript
// In routeApps.tsx
{
  path: "/apps/myapp",
  async lazy() {
    const { default: MyAppView } =
      await import("@/views/apps/myapp/MyAppView");
    return { Component: MyAppView };
  },
}
```
