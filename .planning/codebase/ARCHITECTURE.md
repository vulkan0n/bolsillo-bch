# Architecture

**Analysis Date:** 2026-01-22

## Pattern Overview

**Overall:** Layered MVC-style architecture with Redux state management, service singleton pattern for domain logic, and React component-based UI.

**Key Characteristics:**
- Redux Toolkit for centralized state management with feature slices
- Service layer (dependency injection pattern) for wallet, blockchain, and integrations
- React Router v6 for client-side routing with lazy-loaded page components
- Capacitor for cross-platform mobile integration (iOS/Android/Web)
- SQLite database (via sql.js) for persistent storage with per-wallet databases
- Electrum Cash protocol over WebSocket for blockchain communication

## Layers

**Presentation (React Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/`
- Contains: Views (pages), atoms (UI primitives), layout shells, composite components
- Depends on: Redux, services, hooks, utilities
- Used by: React Router, MainLayout, users

**State Management (Redux Toolkit):**
- Purpose: Centralize application state (wallet data, sync status, preferences, blockchain state)
- Location: `src/redux/`
- Contains: Slices (wallet, sync, preferences, device, txHistory, exchangeRates, walletConnect), async thunks, selectors
- Depends on: Services, utilities
- Used by: Components via useSelector/useDispatch

**Service Layer (Domain Logic):**
- Purpose: Encapsulate business logic for wallet operations, blockchain communication, and integrations
- Location: `src/services/`
- Contains: Singleton services using dependency injection (WalletManagerService, ElectrumService, TransactionBuilderService, etc.)
- Depends on: SQLite database, file system, external APIs
- Used by: Redux thunks, other services

**Storage Layer:**
- Purpose: Persist application and wallet data
- Location: SQLite databases + filesystem
- Contains: `app.db` (shared app data), `{walletHash}.db` (per-wallet data), block cache
- Depends on: Capacitor filesystem, sql.js
- Used by: DatabaseService, services

**Network Layer:**
- Purpose: Communicate with blockchain (Electrum servers)
- Location: `src/services/ElectrumService.ts`
- Contains: WebSocket client wrapping @electrum-cash/network
- Depends on: Electrum servers, Redux sync state
- Used by: Redux sync thunks, wallet services

**Utility Layer:**
- Purpose: Pure functions, constants, and helpers
- Location: `src/util/`
- Contains: Cryptography (cashaddr, sats), address validation, URI parsing, currency conversion
- Depends on: External libraries only
- Used by: Services, components, Redux

## Data Flow

**Wallet Initialization:**

1. App starts → `init.jsx` → PRE_INIT phase
2. PRE_INIT: File system check (JanitorService), app database init (DatabaseService)
3. redux_pre_init: Load preferences and device info
4. APP_INIT: Redux setup, render MainLayout + router
5. POST_INIT: Start Electrum sync, preload BCMR metadata
6. User has wallet → routeWallet → WalletView (outlet for home/send/history)

**Transaction Flow:**

1. User initiates send in WalletViewSend component
2. Component dispatches to Redux or calls TransactionBuilderService directly
3. TransactionBuilderService: Builds BCH transaction (UTXO selection, fee calculation, BIP69 sorting)
4. HdNodeService: Derives keys, signs with libauth
5. TransactionManagerService: Calls ElectrumService.broadcastTransaction()
6. ElectrumService: Sends to Electrum server over WebSocket
7. TransactionManagerService: Polls for confirmation, updates txHistory Redux
8. Components subscribe to txHistory state, re-render

**Blockchain Sync Flow:**

1. ElectrumService maintains WebSocket connection with Electrum server
2. Address subscriptions via address.subscribe() notify of UTXO changes
3. Electrum → Redux syncMiddleware → wallet state updates
4. Components read balance/UTXO state from Redux
5. Block header subscriptions track new blocks
6. BlockchainService stores raw block data on filesystem

**State Management Flow:**

```
Redux Store
├── wallet: Active wallet entity, balances, addresses, UTXOs
├── sync: Electrum connection state, blockchain sync status, chaintip
├── preferences: User settings (theme, currency, language, network)
├── device: Platform info, scanner state, network status
├── txHistory: Transaction history with filtering/sorting
├── exchangeRates: BCH/fiat conversion rates (cached)
├── addresses: Address book derived from wallet addresses
└── walletConnect: WalletConnect v2 session state
```

Components dispatch thunks → services → database/network → Redux → components re-render

## Key Abstractions

**WalletEntity:**
- Purpose: Represents a complete wallet with metadata
- Examples: `src/services/WalletManagerService.ts`
- Pattern: Data class with fields (mnemonic, balance, addresses, UTXOs)

**AddressEntity:**
- Purpose: Individual address with balance and UTXO history
- Examples: `src/services/AddressManagerService.ts`
- Pattern: Holds address, derivation path, balance

**Service Singletons:**
- Purpose: Reusable domain logic with dependency injection
- Examples: `src/services/*.ts` (WalletManagerService, ElectrumService, TransactionBuilderService)
- Pattern: Function returns object with methods; dependencies injected in closure

**Redux Async Thunks:**
- Purpose: Async operations that update Redux state
- Examples: `walletBoot`, `walletSyncDiff`, `fetchExchangeRates`
- Pattern: createAsyncThunk(type, async function, options)

**Route Definitions:**
- Purpose: Organize routes by feature area
- Examples: `src/routes/routeWallet.tsx`, `src/routes/routeApps.tsx`
- Pattern: Arrays of route objects merged into MainLayout children

## Entry Points

**Application Entry:**
- Location: `src/init.jsx`
- Triggers: On app load (or page refresh)
- Responsibilities: Three-phase initialization (PRE_INIT → APP_INIT → POST_INIT), Redux setup, Capacitor app listeners

**Main Router:**
- Location: `src/Main.jsx`
- Triggers: After redux_init() in PRE_INIT phase
- Responsibilities: Redux Provider, Apollo Provider, React Router, error boundary

**Wallet View:**
- Location: `src/components/views/wallet/WalletView.jsx`
- Triggers: User navigates to /wallet (default on app load)
- Responsibilities: Load active wallet, render balance, manage outlet for send/history

**Routes:**
- Location: `src/routes/route*.tsx` files
- Triggers: Browser navigation
- Responsibilities: Lazy-load view components, define nested routes

## Error Handling

**Strategy:** Try/catch in service methods and Redux thunks; Toast notifications for user-facing errors

**Patterns:**

**Service Errors:**
```typescript
// WalletManagerService.ts
if (!walletHash) {
  throw new WalletNotExistsError(walletHash);
}

// ElectrumService.ts
export class ElectrumNotConnectedError extends Error {}
```

**Redux Thunk Error Handling:**
```typescript
// wallet.ts
try {
  // logic
} catch (e) {
  // Log, dispatch error action, or rethrow
}
```

**Component Error Boundary:**
- Location: `src/components/layout/ErrorBoundary.jsx`
- Catches React render errors, displays fallback UI with error details

**Toast Notifications:**
- Location: `src/services/ToastService.tsx`
- Usage: Toast.error("message") for user-facing errors
- Pattern: Wraps react-hot-toast

## Cross-Cutting Concerns

**Logging:**
- Approach: LogService per module (e.g., LogService("redux/wallet"))
- Output: Console in dev, potentially remote in production
- Pattern: Log.debug(), Log.log(), Log.warn(), Log.error()

**Validation:**
- Approach: Pure utility functions in `src/util/` (cashaddr.ts, uri.ts, currency.ts)
- Pattern: validateCashAddr(), parsePaymentUri(), validateCurrency()
- Usage: Called in services and components before state updates

**Authentication:**
- Approach: SecurityService (PIN/biometric) via Capacitor native-biometric plugin
- Pattern: Store encrypted mnemonic, unlock with biometric
- Usage: During wallet creation and key viewing

**Database Transactions:**
- Approach: sql.js in-memory database synced to filesystem
- Pattern: DatabaseService wraps SQL operations
- Lazy Loading: Wallet databases opened on wallet activation, not app boot

**Blockchain Sync:**
- Approach: ElectrumService maintains persistent WebSocket, address subscriptions
- Pattern: Redux syncMiddleware handles connection state
- Retry: Exponential backoff with server blacklist

**Internationalization:**
- Approach: Translation objects in component files (const translations = {...})
- Pattern: translate() utility reads from Redux preferences.language
- Caveat: Cannot include `:` or `'` in values; use `-` and backtick
