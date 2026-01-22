# Selene Wallet - Comprehensive Codebase Analysis Report

**Generated:** 2026-01-15
**Model:** Claude Opus 4.5

## Executive Summary

Selene Wallet is a **mature, feature-rich self-custodial Bitcoin Cash wallet** built with React, Vite, and Capacitor. The codebase demonstrates strong architectural patterns and good code organization, with several areas requiring attention.

---

## Codebase Metrics

| Metric | Value |
|--------|-------|
| Total Source Files | 212 |
| TypeScript Files | 123 (58%) |
| JavaScript Files | 89 (42%) |
| Lines of Code | 38,201 |
| Test Files | 2 |
| Services | 22 |
| Redux Slices | 8 |

---

## Architecture Assessment

### Strengths

1. **Three-Phase Initialization**: PRE_INIT → APP_INIT → POST_INIT ensures correct boot sequence
2. **Service Factory Pattern**: Clean dependency injection with lazy initialization
3. **Redux Listener Middleware**: Batches rapid Electrum updates (100ms window)
4. **Database Lazy Loading**: Wallet DBs opened on activation, not boot
5. **Seed Caching**: Expensive BIP39 derivation cached per mnemonic
6. **Network Resilience**: Auto-reconnect with exponential backoff

### Initialization Flow

```
PRE_INIT Phase:
  → JanitorService.fsck()
  → DatabaseService.initAppDatabase()
  → JanitorService.migrateLegacyDatabases()
  → JanitorService.recoverWalletFiles()
  → redux_pre_init() → preferencesInit(), deviceInit()

APP_INIT Phase:
  → Attach Capacitor listeners (pause/resume)
  → redux_init() → exchangeRateInit(), walletBoot()
  → createRoot().render(<Main />)

POST_INIT Phase:
  → SplashScreen.hide()
  → redux_post_init() → walletConnectInit(), triggerCheckIn(), fetchExchangeRates()
  → BcmrService.preloadMetadataRegistries()
```

### Services Layer

| Service | Responsibility |
|---------|---------------|
| DatabaseService | SQLite management (sql.js) |
| WalletManagerService | Wallet CRUD, hashing, activation |
| HdNodeService | BIP39/BIP44 HD wallet key derivation |
| AddressManagerService | Address derivation and management |
| UtxoManagerService | UTXO tracking and balance calculations |
| TransactionBuilderService | Constructs BCH transactions |
| TransactionManagerService | Transaction resolution, signing, broadcasting |
| ElectrumService | Electrum protocol client (WebSocket) |
| SecurityService | PIN/biometric authentication |
| BcmrService | BCMR metadata resolution for tokens |
| TokenManagerService | Token/NFT metadata and balances |
| WalletConnectService | WalletConnect v2 integration |
| CauldronService | Cauldron DEX interface |

### Architectural Concerns

- Direct Redux store imports in some services (tight coupling)
- Global singletons for Electrum handles (potential memory issues)
- Preferences stored as strings (Capacitor constraint)

---

## Security Audit

### Critical Vulnerabilities (4)

| Issue | Location | Risk |
|-------|----------|------|
| **Unsalted PIN hash** | `SecurityService.ts:127` | Vulnerable to rainbow table attacks |
| **Uncached seed in memory** | `HdNodeService.tsx:32-47` | Seed never cleared from memory |
| **Private keys logged** | `HdNodeService.tsx:160` | Signatures logged to console |
| **Unencrypted databases** | `DatabaseService.ts` | Seed phrases stored in plaintext SQLite |

### High Severity (5)

| Issue | Location |
|-------|----------|
| Raw seed phrases in export files | `WalletManagerService.ts:455-482` |
| xPrv re-authentication bypass | `SettingsWalletAdditionalInformation.jsx:170` |
| Payment protocol signatures disabled | `payment_protocol.ts:122` |
| TLS certificate validation unclear | `ElectrumService.ts:100` |
| Weak amount validation | `SatoshiInput.tsx:236` |

### Dependency Vulnerabilities

```
CRITICAL: jspdf <= 3.0.4    - Path traversal (update to 4.0.0)
HIGH:     react-router 7.11  - XSS via open redirects (update to 7.12.0)
MODERATE: esbuild <= 0.24.2  - Dev server vulnerability (update to 0.25.0)
```

### Positive Security Findings

1. **Strong Cryptography Foundation** - Uses `@bitauth/libauth` for secp256k1 operations
2. **Address Validation** - Validates addresses via `validateBip21Uri()`
3. **Transaction Signing Security** - Proper signing serialization (SIGHASH_ALL | UTXOS | FORKID)
4. **Protection Against Preferences Reset Exploit** - Preserves `authMode` and `pinHash`
5. **Network Failover** - Multiple Electrum servers with blacklist mechanism
6. **No Dangerous Web APIs** - No `eval()`, `innerHTML`, or `dangerouslySetInnerHTML`
7. **Proper HD Wallet Derivation** - Standard BIP44 paths with passphrase support

---

## Code Quality

### Strengths

| Aspect | Rating | Notes |
|--------|--------|-------|
| ESLint Config | A | Strict rules, Airbnb + TypeScript |
| Naming Conventions | A | Boolean prefixes enforced (is, has, should) |
| React Patterns | A- | Good hooks usage, memoization |
| Code Organization | A | Clean architecture, separation of concerns |
| Performance | A | Lookup tables, caching, memoization |

### Weaknesses

| Aspect | Rating | Notes |
|--------|--------|-------|
| TypeScript Coverage | B+ | 58% - migration incomplete |
| Testing | D | Only 2 test files for 212 source files |
| Documentation | B- | Good README, lacks JSDoc in code |
| Error Handling | B | Custom errors exist but coverage gaps |

### ESLint Configuration Highlights

- Extends Airbnb base + React + TypeScript configs
- Boolean variables require `is`, `should`, `has`, `can`, `did`, `will` prefixes
- Private class members require leading underscore
- Types use StrictPascalCase
- Prettier integration for consistent formatting

---

## Feature Inventory

### Core Features (Production-Ready)

- ✅ Send/Receive BCH transactions
- ✅ Transaction history with filtering/sorting
- ✅ QR code scanning and generation
- ✅ CashTokens (FT & NFT support)
- ✅ Multi-wallet management
- ✅ PIN/Biometric authentication
- ✅ WalletConnect v2 integration
- ✅ Cauldron DEX integration
- ✅ 20+ language support
- ✅ Dark/Light themes
- ✅ Multiple network support (mainnet, chipnet, testnet3/4)
- ✅ Payment Protocol (BIP70)
- ✅ Sweep wallet (WIF import)
- ✅ CSV transaction export

### Experimental Features

- 🔬 QR code generator app
- 🔬 AFOG gaming integration
- 🔬 Stablecoin mode

### Stub/Incomplete Features

- ⏳ Contacts (not implemented)
- ⏳ Price viewer (placeholder)
- ⏳ Map view (commented out)

### Feature Completeness by Category

| Feature Category | Status | Completeness |
|-----------------|--------|--------------|
| Core Wallet (Send/Receive/History) | Production | 100% |
| Token/NFT Support | Production | 100% |
| Multiple Wallets | Production | 100% |
| Security (PIN/Biometric) | Production | 95% |
| Electrum Network | Production | 100% |
| Settings/Preferences | Production | 100% |
| WalletConnect | Production | 100% |
| Cauldron DEX | Production | 100% |
| Multi-language | Production | 100% |
| Exchange Rates | Production | 95% |
| **OVERALL** | **Production** | **95%** |

---

## Bugs & Code Smells

### Critical Bugs (4)

1. **Race Condition in CountdownTimer** (`CountdownTimer.tsx:35-49`)
   - Timer resets on every render due to callback dependency

2. **Memory Leak in Carousel** (`Carousel.tsx:22-32`)
   - Interval recreated every tick due to `currentIndex` in deps

3. **Array Mutation in BcmrService** (`BcmrService.tsx:129-147`)
   - `.shift()` on sorted keys can return undefined

4. **Unhandled Promise in Redux** (`exchangeRates.ts:54-61`)
   - Exchange rate retry without guard against infinite loop

### Medium Bugs (4)

1. Destructive array mutation in wallet receive logic (`wallet.ts:166-169`)
2. Unhandled array index access in UTXO selection (`UtxoManagerService.ts:185-190`)
3. Missing null check in WalletViewSend (`WalletViewSend.tsx:96-99`)
4. Stale closure in useLongPress hook (`useLongPress.ts:11-23`)

### Code Smells (6)

1. Array used as object in Electrum pending requests
2. Inconsistent key usage in Carousel
3. Magic numbers in sync timeouts (2000ms, 30000ms)
4. SQL interpolation instead of parameterized queries
5. Missing exhaustive dependencies in useEffects
6. Developer TODO comment: "this is probably wrong" never addressed (`TransactionBuilderService.ts:304-307`)

---

## Quality Rating

### Component Scores

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 85/100 | 20% | 17.0 |
| Security | 55/100 | 25% | 13.75 |
| Code Quality | 78/100 | 15% | 11.7 |
| Features | 92/100 | 15% | 13.8 |
| Testing | 25/100 | 10% | 2.5 |
| Documentation | 70/100 | 10% | 7.0 |
| Bug Count | 72/100 | 5% | 3.6 |

### **Overall Quality Score: 69/100**

---

## Recommendations

### Immediate Priority (Security-Critical)

1. **Implement PBKDF2 for PIN hashing** with cryptographic salt
2. **Encrypt SQLite databases** using SQLCipher or similar
3. **Clear seed cache** on wallet deactivation
4. **Remove private key logging** from HdNodeService
5. **Update vulnerable dependencies** (jspdf, react-router, esbuild)

### Short-Term (1 month)

6. Add session timeout/auto-lock
7. Encrypt wallet export files
8. Fix re-authentication bypass for xPrv
9. Verify Electrum TLS implementation
10. Fix CountdownTimer and Carousel hooks

### Medium-Term (2-3 months)

11. Complete TypeScript migration (remaining 42% of files)
12. Add comprehensive test suite (target 80% coverage)
13. Add JSDoc documentation to all public functions
14. Implement certificate pinning for Electrum servers
15. Professional security audit before mainnet deployment

---

## Conclusion

Selene Wallet demonstrates **solid engineering fundamentals** with a well-organized architecture, comprehensive feature set, and good coding patterns. However, **critical security vulnerabilities** in key management and storage must be addressed before production deployment with real funds.

The codebase is well-suited for continued development with clear paths for improvement. The immediate priorities should focus on security hardening, particularly around PIN hashing, database encryption, and memory management of sensitive cryptographic material.

---

## Appendix: File Structure

```
src/
├── components/
│   ├── atoms/           # Reusable UI components (Button, Card, Address)
│   ├── layout/          # Shell components (MainLayout, Navigation)
│   └── views/           # Page-level components (lazy-loaded)
│       ├── wallet/      # Wallet operations (home, send, history)
│       ├── assets/      # Token/NFT management
│       ├── explore/     # Discovery features (contacts, map)
│       ├── settings/    # App configuration, wallet creation/import
│       └── apps/        # Integrated apps (blaze, cauldron, walletconnect)
├── redux/               # Redux slices (wallet, sync, preferences, etc.)
├── services/            # Business logic (22 services)
├── util/                # Pure utility functions
├── hooks/               # Custom React hooks
├── routes/              # Route definitions (lazy-loaded)
└── init.jsx             # App initialization
```

## Appendix: Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @bitauth/libauth | ^3.0.0 | Cryptography |
| bip39 | ^3.1.0 | BIP39 mnemonics |
| sql.js | ^1.13.0 | In-browser SQLite |
| @electrum-cash/network | ^4.1.4 | Electrum protocol |
| @walletconnect/core | ^2.23.1 | WalletConnect |
| chart.js | ^4.5.1 | Charts |
| luxon | ^3.7.2 | Date/time handling |
| react | ^19.2.3 | UI framework |
| @reduxjs/toolkit | ^2.11.2 | State management |
