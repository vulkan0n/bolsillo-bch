# Coding Conventions

**Analysis Date:** 2026-01-22

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Button.tsx`, `MainLayout.jsx`, `WalletViewHome.tsx`)
- Utilities: camelCase (e.g., `sats.ts`, `cashaddr.ts`, `uri.ts`)
- Services: PascalCase (e.g., `WalletManagerService.ts`, `DatabaseService.ts`)
- Redux slices: camelCase (e.g., `wallet.ts`, `preferences.ts`, `sync.ts`)
- Test files: append `.test.ts` to source filename (e.g., `sats.test.ts`, `cashaddr.test.ts`)
- Translation files: colocated as `translations.ts/js` in component directory

**Functions:**
- camelCase for all functions: `satsToBch()`, `extractBchAddresses()`, `validateBip21Uri()`
- Service methods return objects with camelCase properties: `listWallets`, `getWallet`, `createWallet`
- Redux async thunks use camelCase: `walletBoot`, `walletSyncDiff`
- Named functions required in useEffect hooks (ESLint rule): `function setDarkModeCss() {...}`

**Variables:**
- camelCase for standard variables: `walletHash`, `qrCodeSettings`, `bchNetwork`
- UPPER_CASE for constants: `SATOSHI`, `MAX_SATOSHI`, `DUST_RELAY_FEE`, `VALID_DENOMINATIONS`
- Boolean variables prefixed with is/should/has/can/did/will: `isSyncing`, `shouldShowFocusedQr`, `hasPrivateKey`, `canProceed`

**Types:**
- StrictPascalCase for all types and interfaces: `WalletEntity`, `AddressEntity`, `ButtonProps`, `CardProps`, `ValidBchNetwork`
- Error classes: StrictPascalCase + `Error` suffix: `WalletNotExistsError`, `WalletConnectNotInitializedError`
- Enums: StrictPascalCase: `ThemeMode`

**Private class members:**
- Must have leading underscore: `_database`, `_cache`

## Code Style

**Formatting:**
- Tool: Prettier (enforced via ESLint)
- Print width: 80 characters
- Tab width: 2 spaces
- Quotes: Double quotes for strings
- Semicolons: Required
- Trailing comma: ES5 style (trailing commas in multiline arrays/objects)

**Linting:**
- Tool: ESLint with Airbnb + TypeScript + Prettier configs
- Config file: `.eslintrc.json`
- Extends: `airbnb-base`, `airbnb/rules/react`, `airbnb-typescript`, `plugin:prettier/recommended`
- Key enforced rules:
  - `no-throw-literal`: Error - always throw Error instances, not strings
  - `prefer-destructuring`: Error for objects, not arrays
  - `import/prefer-default-export`: Off - prefer named exports
  - `react/require-default-props`: Error - use defaultArguments for function defaults
  - `space-before-function-paren`: Enforce space before named function parens, no space before anonymous

## Import Organization

**Order:**
1. External dependencies (React, react-router, Redux, services, utilities)
2. Internal imports from `@/` aliases
3. Component imports from local paths
4. Translation imports

**Path Aliases (configured in vite.config.js):**
- `@/` → `src/`
- `@/layout` → `src/components/layout`
- `@/views` → `src/components/views`
- `@/atoms` → `src/components/atoms`
- `@/icons` → `src/components/atoms/icons`
- `@/apps` → `src/components/views/apps`
- `@/composite` → `src/components/composite`

**File extensions:**
- Never omit extensions for imports EXCEPT for relative imports in same directory
- Always include extension for: `.svg`, `.png`, `.json`, `.sql` files (ESLint rule)
- Omit extension for: `.ts`, `.tsx`, `.js`, `.jsx` files

**Example import block:**
```typescript
import { useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormOutlined, CaretRightOutlined } from "@ant-design/icons";

import { selectActiveWalletHash } from "@/redux/wallet";
import { selectBchNetwork, setPreference } from "@/redux/preferences";
import AddressManagerService from "@/services/AddressManagerService";

import FullColumn from "@/layout/FullColumn";
import Address from "@/atoms/Address";

import { satsToBch } from "@/util/sats";
import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";
```

## Error Handling

**Pattern: Custom Error Classes**
- Define as StrictPascalCase extending Error
- Location: Near service/module where thrown
- Example from `WalletManagerService.ts`:
```typescript
export class WalletNotExistsError extends Error {
  constructor(walletHash: string) {
    super(`No Wallet with walletHash ${walletHash}`);
  }
}
```

**Pattern: Try-Catch in Service Layer**
- Services use try-catch for database and external API calls
- Catch blocks typically log and re-throw or return error payload
- Example from `JanitorService.ts`:
```typescript
try {
  // operation
} catch (e) {
  Log.error("Context:", e);
}
```

**Pattern: Error Resolution in Redux Thunks**
- Thunks handle async errors and dispatch error payloads
- Error handling done at Redux layer, not in components
- Components consume error state from Redux selectors

**Pattern: Validation Functions**
- Return boolean or object with validation result properties
- Examples: `validateBip21Uri()`, `validateWifUri()`, `validateWalletConnectUri()` all return objects with `is*` boolean flags
- Example structure:
```typescript
export function validateBip21Uri(uri: string) {
  return {
    isBip21: boolean,
    isCashAddress: boolean,
    isBase58Address: boolean,
    address: string,
    amount: number,
  };
}
```

**Pattern: Early Return in Validators**
- Guard clauses at top of functions to handle invalid cases
- Return object with sensible defaults when validation fails
- Prevents throwing exceptions for expected validation failures

## Logging

**Framework:** js-logger (wrapped by `LogService`)

**Usage:**
```typescript
import LogService from "@/services/LogService";

const Log = LogService("moduleName");
Log.info("message");
Log.error("error context:", error);
Log.debug("debug message");
```

**Patterns:**
- Create logger per module/service: `const Log = LogService("redux/wallet")`
- Log errors with context: `Log.error("Context:", e)`
- Debug logging for sync operations, connection state
- Logs are both written to console AND registered in ConsoleService for in-app debug view

## Comments

**When to Comment:**
- At function level to explain WHY, not WHAT
- For critical financial/security operations (precision handling, cryptographic operations)
- To document workarounds or handled edge cases
- To reference issue numbers for context

**Block Comments (critical sections):**
```typescript
/**
 * Unit tests for sats.ts - satoshi/BCH conversion utilities
 *
 * These tests are CRITICAL because incorrect conversions = lost money.
 * We test:
 * - Normal cases (happy path)
 * - Edge cases (zero, maximum values)
 * - Precision handling (8 decimal places)
 */
```

**Inline Comments (edge cases):**
```typescript
// various providers do stupid things with cashaddr that we must handle.
// in the wild we've seen:
// -  addresses with multiple prefixes (bitcoincash:bitcoincash:qz38adf...)
// -  prefix followed by base58 (bitcoincash:1D3ADB...)
```

**JSDoc/TSDoc:**
- Used minimally - main use is for exported utility functions with complex behavior
- Document function signature with param types if not obvious from TypeScript
- Not required for Redux selectors or simple getters

## Function Design

**Size:** Prefer functions under 50 lines; longer functions should be split into helpers

**Parameters:**
- Prefer object destructuring over positional parameters for >2 args
- Function parameters use camelCase: `bch`, `denomination`, `walletHash`

**Return Values:**
- Utility functions return single value or tuple: `bigint`, `string`, `{ sats: bigint, bch: string }`
- Validation functions return objects with boolean flags: `{ isBip21: boolean, address: string }`
- Service methods return objects with multiple properties
- Async functions (Redux thunks) return payload that becomes action.payload

**Side Effects:**
- Keep functions pure when possible (math, parsing, validation)
- Side effects (IO, crypto signing) isolated in services
- Services are singletons with dependency injection pattern

## Module Design

**Exports:**
- Prefer named exports over default exports (ESLint: `import/prefer-default-export` off)
- Exception: Default export for React components (components are often imported as default in routes)
- Services export default function that returns object: `export default function MyService() { return { method1, method2 }; }`

**Barrel Files:**
- Index files in component directories may re-export for convenience
- Test files ignored in ESLint (patterns: `*.test.*`, `setupTests.js`)
- App files in views/apps directory ignored in ESLint

**Service Singleton Pattern:**
```typescript
// Service structure
export default function MyService() {
  const Database = DatabaseService(); // dependency injection
  const Log = LogService("MyService");

  return {
    publicMethod1,
    publicMethod2,
    // private functions defined below
  };

  function publicMethod1() {
    // implementation
  }

  function publicMethod2() {
    // implementation
  }
}

// Usage
const service = MyService();
service.publicMethod1();
```

**Redux Slice Structure:**
```typescript
// Uses Redux Toolkit slices with:
// - initialState as plain object
// - createReducer for mutation-based updates (immer enabled)
// - createSelector for memoized selectors
// - createAsyncThunk for async operations
// - Selectors named select* (selectActiveWalletHash, selectIsSyncing)
```

## React Conventions

**Component Types:**
- Function components only (no class components)
- Named exports preferred, but lazy-loaded routes use default exports
- Functional components with hooks for state and effects

**Hooks Usage:**
- `useState` for local component state
- `useEffect` with named functions (ESLint requirement)
- `useSelector` to read Redux state
- `useDispatch` to dispatch Redux actions
- `useMemo` for expensive calculations
- `useRef` for refs to DOM elements or service instances

**Example Hook Pattern:**
```typescript
export default function WalletViewHome() {
  const dispatch = useDispatch();

  const walletHash = useSelector(selectActiveWalletHash);
  const isSyncing = useSelector(selectIsSyncing);

  useEffect(
    function setDarkModeCss() {
      if (!html) return () => {};
      if (isDarkMode) html.classList.add("dark");
      return () => html.classList.remove("dark");
    },
    [html, isDarkMode]
  );

  return <div>{/* JSX */}</div>;
}
```

**Props:**
- Use TypeScript interfaces with `Props` suffix: `ButtonProps`, `CardProps`
- Required props have no default value
- Optional props use `?` and provide defaultArguments in function signature
- Avoid prop spreading (ESLint: `react/jsx-props-no-spreading` off - actually allowed)

**JSX:**
- No need to import React (ESLint: `react/react-in-jsx-scope` off, using react-jsx transform)
- Prefer explicit prop passing over spreading
- Conditional rendering: use ternary or `&&` operator

---

*Convention analysis: 2026-01-22*
