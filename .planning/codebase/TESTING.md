# Testing Patterns

**Analysis Date:** 2026-01-22

## Test Framework

**Runner:**
- Vitest (v4.0.17)
- Config: `vite.config.js` with test section
- Environment: Node (not JSDOM - tests run in Node environment)

**Assertion Library:**
- Vitest built-in (similar to Jest expect API)
- Extended with `@testing-library/jest-dom` matchers

**Run Commands:**
```bash
pnpm test              # Run linter + vitest (all tests)
pnpm vitest            # Run tests in watch mode
pnpm lint              # Prettier check + ESLint (runs before tests)
pnpm pretty            # Auto-format code with Prettier
```

## Test File Organization

**Location:**
- Co-located with source files in same directory
- Not in separate `__tests__` directory

**Naming:**
- Pattern: `{filename}.test.ts` or `{filename}.test.tsx`
- Example: `sats.test.ts` tests `sats.ts`

**Structure:**
```
src/
├── util/
│   ├── sats.ts
│   ├── sats.test.ts
│   ├── cashaddr.ts
│   ├── cashaddr.test.ts
│   ├── uri.ts
│   └── uri.test.ts
├── redux/
│   ├── preferences.ts
│   └── preferences.test.ts
```

**ESLint Ignoring:**
- Test files ignored by ESLint linter
- Patterns: `*.test.*`, `*.spec.*`, `setupTests.js`
- Allows test-specific patterns and code

## Test Structure

**Suite Organization (from src/util/sats.test.ts):**
```typescript
import { satsToBch, bchToSats, SATOSHI, MAX_SATOSHI } from "./sats";

describe("sats.ts", () => {
  describe("satsToBch", () => {
    it("converts 1 BCH worth of sats correctly", () => {
      const result = satsToBch(100000000n);
      expect(result.sats).toBe(100000000n);
      expect(result.bch).toBe("1.00000000");
    });

    it("converts 0 sats correctly", () => {
      const result = satsToBch(0n);
      expect(result.sats).toBe(0n);
      expect(result.bch).toBe("0.00000000");
    });
  });

  describe("constants", () => {
    it("SATOSHI is 100 million", () => {
      expect(SATOSHI).toBe(100000000n);
    });
  });
});
```

**Patterns:**
- Nested `describe()` blocks for grouping related tests
- Test name format: `it("description of what should happen", () => { ... })`
- Setup: Direct variable assignment, no beforeEach hooks observed
- Teardown: Return cleanup function from useEffect (React testing), not used in utility tests
- Assertion: Direct `expect()` statements, one or multiple per test

## Mocking

**Framework:** Vitest `vi` module

**Mocking Capacitor Plugins (src/setupTests.js):**
```typescript
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock Capacitor filesystem
vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
  Directory: {
    Data: "DATA",
    Documents: "DOCUMENTS",
    Cache: "CACHE",
  },
}));

// Mock service dependencies
vi.mock("@/services/WalletManagerService", () => ({
  default: () => ({
    getPrefix: () => "bitcoincash",
    getNetwork: () => "mainnet",
  }),
}));
```

**Mocking Pattern:**
- Module-level mocks in `src/setupTests.js` (runs before each test)
- Mocks replace entire module with `vi.mock(path, factory)`
- Factory function returns object structure matching real module
- Capacitor plugins mocked because they don't exist in Node environment

**What to Mock:**
- Capacitor plugins (filesystem, preferences, clipboard, haptics, etc.) - not available in Node
- sql.js WASM loading - causes issues in test environment
- WalletManagerService when testing utility functions that call it
- External services when testing isolated logic

**What NOT to Mock:**
- Pure utility functions (sats.ts, cashaddr.ts, uri.ts) - test actual implementations
- Redux reducer logic - test actual state transitions
- Validation functions - test actual validation rules
- Business logic functions - test actual algorithms

## Fixtures and Factories

**Test Data (from src/util/cashaddr.test.ts):**
```typescript
// Test addresses - these are REAL valid addresses (checksums verified)
const VALID_LEGACY = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2";
const VALID_CASHADDR = "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
const VALID_CASHADDR_NO_PREFIX = "qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
```

**Factory Pattern (from src/redux/preferences.test.ts):**
```typescript
const makePrefs = (overrides: Partial<ValidPreferences>): ValidPreferences => ({
  ...defaultPreferences,
  ...overrides,
});

// Usage
const result = validatePreferences(
  makePrefs({ localCurrency: "REMOVED_CURRENCY" })
);
```

**Location:**
- Test constants defined at top of test file
- Factories defined as helper functions in test file
- Real valid values used for financial/security operations (real BCH addresses, WIFs)

## Coverage

**Requirements:** Not enforced (no coverage threshold in vitest.config.js)

**View Coverage:**
```bash
pnpm vitest --coverage  # (if coverage config added)
```

**Currently Tested:**
- Utility functions in `src/util/` (100% coverage expected):
  - `sats.ts` - conversion and constants
  - `cashaddr.ts` - address validation and conversion
  - `uri.ts` - URI parsing (BIP21, WIF, WalletConnect, Payment Protocol)
  - `currency.ts` - currency formatting
- Redux slices (`preferences.test.ts`) - validation and state
- Not tested: Service layer (tightly coupled to IO), Components (UI testing not setup)

## Test Types

**Unit Tests:**
- Scope: Single function or utility in isolation
- Approach: Direct function calls with known inputs, assert outputs
- Files: `src/util/*.test.ts`, `src/redux/*.test.ts`
- Example: `satsToBch(100000000n)` returns `{ sats: 100000000n, bch: "1.00000000" }`

**Integration Tests:**
- Not currently implemented (would require database/service layer mocking)
- Services are not easily testable without major refactoring (see CONCERNS.md)

**E2E Tests:**
- Not implemented
- Mobile E2E testing would require Capacitor simulator/emulator

## Common Patterns

**Edge Case Testing (sats.test.ts):**
```typescript
describe("round-trip conversions", () => {
  // These tests ensure converting BCH -> sats -> BCH gives the same result
  it("round-trips 1 BCH correctly", () => {
    const sats = bchToSats(1);
    const bch = satsToBch(sats);
    expect(bch.bch).toBe("1.00000000");
  });

  it("round-trips fractional BCH correctly", () => {
    const original = "0.12345678";
    const sats = bchToSats(original);
    const bch = satsToBch(sats);
    expect(bch.bch).toBe(original);
  });
});
```

**Error Testing (uri.test.ts):**
```typescript
describe("validateBip21Uri", () => {
  describe("edge cases", () => {
    it("rejects invalid addresses", () => {
      const result = validateBip21Uri("not-an-address");
      expect(result.isBip21).toBe(false);
      expect(result.address).toBe("");
    });

    it("handles double-prefixed addresses (bug in some wallets)", () => {
      const doublePrefix = `bitcoincash:bitcoincash:${VALID_CASHADDR_NO_PREFIX}`;
      const result = validateBip21Uri(doublePrefix);
      expect(result.isBip21).toBe(true);
    });
  });
});
```

**Type Coercion Testing (preferences.test.ts):**
```typescript
describe("type coercion edge cases", () => {
  it("handles number passed as lastExchangeRate", () => {
    // parseFloat(1) works, so this actually passes
    const prefs = makePrefs({});
    (prefs as Record<string, unknown>).lastExchangeRate = 1;
    expect(validatePreferences(prefs)).toBe(true);
  });

  it("rejects null lastExchangeRate", () => {
    const prefs = makePrefs({});
    (prefs as Record<string, unknown>).lastExchangeRate = null;
    expect(validatePreferences(prefs)).toBe(false);
  });
});
```

**Multiple Input Types Testing (sats.test.ts):**
```typescript
describe("satsToBch", () => {
  it("accepts number input", () => {
    const result = satsToBch(50000000);
    expect(result.sats).toBe(50000000n);
    expect(result.bch).toBe("0.50000000");
  });

  it("accepts string input", () => {
    const result = satsToBch("25000000");
    expect(result.sats).toBe(25000000n);
    expect(result.bch).toBe("0.25000000");
  });
});
```

**Array Iteration Testing (preferences.test.ts):**
```typescript
it("accepts all currencies currently in currencyList", () => {
  currencyList.forEach((c) => {
    const result = validatePreferences(
      makePrefs({ localCurrency: c.currency })
    );
    expect(result, `${c.currency} should be valid`).toBe(true);
  });
});
```

## Test Data Notes

**Why Real Addresses/WIFs:**
- `1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2` is Satoshi's genesis address (famous, safe to use)
- `5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ` is a well-known test WIF
- Tests verify that parsing/validation works with real valid data
- Comments note that test data should not be used with real funds

**Network Addressing:**
- Tests use `bitcoincash:` prefix (mainnet) by default
- Some tests verify alternate prefixes (`bchtest:`, `bchreg:`)
- Addresses must match network prefix for validation to pass

## Setup and Teardown

**Setup (src/setupTests.js):**
- Runs once before test suite
- Mocks all Capacitor plugins and external services
- Loads testing-library matchers
- No per-test setup hooks observed

**Teardown:**
- Return cleanup function from `useEffect` in React component tests (if added)
- vi.mocks automatically reset between tests
- Manual cleanup not needed for these unit tests

## Skipping/Focusing Tests

**Not observed in codebase:**
- `it.skip()`, `it.only()`, `describe.skip()` not used
- All tests run in CI/CD pipeline

---

*Testing analysis: 2026-01-22*
