# Codebase Concerns

**Analysis Date:** 2026-01-22

## Tech Debt

**Type Inconsistencies Across Boundaries:**
- Issue: UTXO and token types differ across Electrum API, SQLite, and libauth boundaries. `tx_hash` vs `txid`, `value` (number) vs `amount` (bigint), `token_data.amount` (string) vs `token_amount` (bigint)
- Files: `src/services/TransactionBuilderService.ts` (lines 38-51), `src/services/AddressScannerService.ts`, `src/services/TransactionHistoryService.ts`, `src/services/TokenManagerService.ts`
- Impact: Prevents clean extraction of pure functions for testing. Type safety is compromised at boundary transformations. Future bugs likely when migrating data between layers.
- Fix approach: Define canonical types in `src/core/types.ts` with explicit transform functions at each boundary. Export and test these transformers independently.

**Fee Calculation Not Implemented:**
- Issue: Transaction fee calculation is incomplete. Line 540 in `src/services/TransactionHistoryService.ts` has TODO noting `totalOutput - amount = fee` is not calculated
- Files: `src/services/TransactionHistoryService.ts` (line 540)
- Impact: Transaction history may show incorrect fee information. User cannot see true transaction costs.
- Fix approach: Implement fee calculation by subtracting outputs from inputs, ensuring all UTXO types are handled consistently.

**Token Sending Limitations Hard-Coded:**
- Issue: Multiple token operations are disabled with TODOs. Cannot send additional BCH with tokens (line 177), cannot send multiple token categories (line 187)
- Files: `src/components/views/wallet/send/WalletViewSend.tsx` (lines 177, 187)
- Impact: Users can only send single token category at a time. Feature parity with BCH-only sends not available.
- Fix approach: Extend transaction builder to support multi-category token sends. Requires UI changes to WalletViewSend and backend changes to TransactionBuilderService.

**Exchange Rate Caching Strategy:**
- Issue: Exchange rates cached globally, not per-block. Will become stale during price volatility
- Files: `src/redux/exchangeRates.ts` (line 41), `src/redux/preferences.ts` (lines 31, 43)
- Impact: Historical transaction values incorrect if user views old transactions during price swings. No per-block rate tracking.
- Fix approach: Move exchange rate storage to wallet database with block height association. Requires migration of existing stored rates.

**Stablecoin Mode Storage Location:**
- Issue: Stablecoin preference stored in global preferences, should be per-wallet
- Files: `src/redux/preferences.ts` (line 43)
- Impact: Users with multiple wallets cannot have different stablecoin mode settings per wallet.
- Fix approach: Move `stablecoinMode` from global preferences to wallet-specific database storage.

**Electrum Peer Database Not Implemented:**
- Issue: TODO #420 notes electrum peer database not implemented, using hardcoded server list
- Files: `src/redux/preferences.ts` (line 67)
- Impact: Cannot dynamically discover or prefer faster Electrum servers. Network performance not optimized per user location.
- Fix approach: Implement peer discovery and latency-based server selection with persistent storage.

**Cron Tasking Not Implemented:**
- Issue: Background task scheduling uses setTimeout with hardcoded intervals
- Files: `src/redux/sync.ts` (line 496)
- Impact: No proper task scheduling. Timing may drift. Cannot guarantee periodic operations execute.
- Fix approach: Implement proper cron or task scheduling library (e.g., node-cron, later.js).

**Stats API Check-In Interval Not Enforced Server-Side:**
- Issue: Check-in interval should be enforced by server, but client decides frequency
- Files: `src/redux/stats.js` (line 26)
- Impact: Users can bypass rate limiting by manipulating client code. Server vulnerability.
- Fix approach: Require server to validate check-in timestamps and reject rapid sequences.

**Translation Script Blocking Bug:**
- Issue: Known bug with WalletViewSend translations and "notEnoughFee" key. Requires manual save/restore during translation script runs
- Files: `src/components/views/wallet/send/WalletViewSend.tsx` (translation file), automation script
- Impact: Translation workflow is fragile and error-prone. Easy to lose translations accidentally.
- Fix approach: Make translation script aware of this key and preserve it automatically. Add validation to prevent key loss.

**Payment Protocol Implementation Outdated:**
- Issue: Custom JSON payment protocol implementation pending release of @xocash/json-payment-protocol-v2
- Files: `src/util/payment_protocol.ts` (line 1)
- Impact: Maintaining duplicate payment protocol code. When official package released, will require migration.
- Fix approach: Monitor @xocash/json-payment-protocol-v2 release and migrate when available.

**Accordion Component Self-Critique:**
- Issue: Component marked with TODO "refactor this component it kinda sucks too"
- Files: `src/components/atoms/Accordion.tsx` (line 1)
- Impact: Known bad component. Likely fragile or has UX issues. Low confidence in stability.
- Fix approach: Refactor Accordion component for clarity and robustness.

## Fragile Areas

**Merkle Proof Validation Not Implemented:**
- Issue: UTXO merkle inclusion validation skipped. Code explicitly ignores merkles, trusting Electrum server
- Files: `src/services/AddressScannerService.ts` (lines 430, 456)
- Impact: Malicious Electrum server could inject fake UTXOs. Double-spend risk. No proof of inclusion verification.
- Priority: High
- Safe modification: Requires implementing merkle inclusion proof validation against block headers. Non-trivial cryptographic change.
- Test coverage: No tests for merkle validation logic. This would be new code path.

**Large Components with Complex State:**
- Issue: WalletViewSend (1038 lines), TransactionExportService (1054 lines), TransactionBuilderService (937 lines)
- Files: `src/components/views/wallet/send/WalletViewSend.tsx`, `src/services/TransactionExportService.ts`, `src/services/TransactionBuilderService.ts`
- Impact: Hard to test, understand, and modify. Likely many edge cases. High bug risk.
- Safe modification: Extract pure utility functions out of services. Break components into smaller, independently testable pieces.
- Test coverage: Only 5 test files total in codebase. Services lack unit tests due to tight IO coupling.

**Promise Error Handling Gaps:**
- Issue: Extensive catch blocks that just log errors without proper recovery. Many `catch(e) { Log.error(e) }` patterns
- Files: `src/services/JanitorService.ts` (multiple catch blocks), `src/services/TransactionHistoryService.ts`, most service files
- Impact: Silent failures. Error context lost. No retry logic or fallback behavior.
- Safe modification: Implement consistent error handling strategy with typed error classes and recovery paths.
- Test coverage: No tests for error paths. Catch blocks are untested.

**Lazy Database Loading with No Error Boundaries:**
- Issue: Wallet databases opened lazily without transaction or error recovery. If opening fails during critical operations, wallet becomes corrupted.
- Files: `src/services/DatabaseService.ts`, `src/services/WalletManagerService.ts`
- Impact: No protection against partial writes. Database corruption possible if error occurs during migration or write.
- Safe modification: Wrap database operations in transactions. Implement rollback on error.
- Test coverage: Database error scenarios not tested.

**Redux Listener Middleware Async Handling:**
- Issue: `syncMiddleware` listener middleware chains many async operations with await in loops and Promise.all without cancellation support
- Files: `src/redux/sync.ts` (lines 231-340, 408-449)
- Impact: If sync operation is interrupted (app pause, network change), pending promises continue executing. Potential race conditions with state mutations.
- Safe modification: Implement cancellation tokens or AbortController for long-running sync operations.
- Test coverage: Sync operations not tested. Edge case of mid-sync interruption not covered.

**Security Service PIN Validation Inadequate:**
- Issue: PIN stored as SHA256 hash with no salt. No rate limiting on failed attempts. Biometric fallback can be bypassed by device PIN.
- Files: `src/services/SecurityService.ts` (lines 113-120)
- Impact: Weak PIN authentication. Brute force possible against hashed PIN. Biometric security is only as strong as device unlock PIN.
- Safe modification: Add salt to PIN hash. Implement attempt counter with lockout. Make biometric primary authentication.
- Test coverage: No security tests. PIN validation logic untested.

## Security Considerations

**Private Key Handling in Memory:**
- Risk: HDNode and private key material kept in service instances. No explicit memory clearing after use.
- Files: `src/services/HdNodeService.tsx`, `src/services/TransactionBuilderService.ts` (key signing)
- Current mitigation: Capacitor ecosystem provides some protection on mobile platforms
- Recommendations: Implement explicit zeroing of sensitive data after use. Consider hardware wallet integration. Add memory profiling to detect key leaks.

**Unvalidated Electrum Responses:**
- Risk: UTXO data, transaction history, and block information accepted from Electrum servers without merkle proof validation
- Files: `src/services/AddressScannerService.ts` (lines 427-435, 449-463)
- Current mitigation: Multi-server fallback provides some resilience
- Recommendations: Implement merkle inclusion proof validation. Add transaction verification against block hash. Log and alert on merkle failures.

**XSS Vulnerability in Token Metadata Rendering:**
- Risk: Token names and descriptions from BCMR metadata rendered without sanitization
- Files: `src/services/BcmrService.tsx`, token display components
- Current mitigation: React's JSX provides some escaping by default
- Recommendations: Add explicit HTML sanitization before rendering metadata. Validate BCMR metadata schema strictly.

**QR Code Content Injection:**
- Risk: QR code content could be manipulated by malicious apps or compromised settings
- Files: `src/components/views/wallet/home/FocusedQrView.tsx`
- Current mitigation: User controls QR code content directly
- Recommendations: Add checksum validation. Warn user if address changes unexpectedly between QR displays.

## Performance Bottlenecks

**Address Scanning Sequential Rather Than Parallel:**
- Problem: Address discovery happens one address at a time with polling loops
- Files: `src/redux/sync.ts` (lines 430-449)
- Cause: `await AddressScanner.scanMoreAddresses()` called in loop sequentially
- Improvement path: Batch address requests. Use Promise.all for parallel scanning. Implement checkpoints for resumption.

**BCMR Metadata Loading Blocks Sync:**
- Problem: Token metadata resolution happens during sync, blocking other operations
- Files: `src/services/BcmrService.tsx`, `src/redux/sync.ts`
- Cause: Metadata fetches not background threaded. Sync waits for BCMR responses.
- Improvement path: Move BCMR loading to background task. Return partial data while fetching metadata.

**Full History Fetch on Wallet Activation:**
- Problem: All historical transactions fetched at once for newly activated wallets
- Files: `src/redux/sync.ts` (lines 296-307)
- Cause: No pagination or lazy loading of history
- Improvement path: Implement pagination. Load recent transactions first. Background older transactions.

**SQLite Database Not Indexed:**
- Problem: Large transaction and UTXO queries without proper indexes
- Files: `src/util/migrations.ts` (database schema)
- Cause: No strategic indexes on query columns (address, tx_hash, timestamp)
- Improvement path: Add indexes on address, transaction hash, and timestamp columns. Profile queries before/after.

## Scaling Limits

**Database Size with No Archival:**
- Current capacity: Single SQLite database grows unbounded with transaction history
- Limit: File system storage exhaustion on mobile devices (especially iOS with app sandbox limits)
- Scaling path: Implement transaction archival. Move old transactions to compressed format. Add database pruning option.

**Electrum Server Capacity:**
- Current capacity: Single server connection per network
- Limit: Server rate limits hit during high transaction volume or many address subscriptions
- Scaling path: Implement server pooling and load balancing. Distribute subscriptions across multiple servers.

**Memory Usage During Large Address Imports:**
- Current capacity: Generating many addresses at once
- Limit: Mobile device RAM exhaustion if importing 1000+ addresses
- Scaling path: Implement streaming address generation. Process in batches with garbage collection between.

## Test Coverage Gaps

**Service Layer Untested:**
- What's not tested: Almost all business logic in `src/services/` is untested
- Files: `src/services/` (except minimal tests in a few files)
- Risk: Service layer bugs go undetected. Complex transaction logic not validated.
- Priority: High

**Redux Async Thunks Untested:**
- What's not tested: Sync initialization, connection retry logic, UTXO diff calculation
- Files: `src/redux/sync.ts`, `src/redux/exchangeRates.ts`
- Risk: State management bugs during app lifecycle. Sync failures not caught early.
- Priority: High

**Component Integration Untested:**
- What's not tested: WalletViewSend form submission, token sending, address validation UI
- Files: `src/components/views/wallet/send/WalletViewSend.tsx` and related components
- Risk: UX bugs. Form validation failures. Sending to wrong address.
- Priority: High

**Error Path Handling Untested:**
- What's not tested: All catch blocks. Network failures. Database errors. Invalid responses.
- Files: Across all services and components
- Risk: Error handling code is dead code. Failures will expose bad error messages.
- Priority: Medium

**Electrum Protocol Variations Untested:**
- What's not tested: Different Electrum server implementations (Electrum, Fulcrum, Rostrum) returning slightly different formats
- Files: `src/services/ElectrumService.ts`
- Risk: Version mismatch errors. Unexpected response formats crash parser.
- Priority: Medium

## Missing Critical Features

**No Wallet Backup/Recovery Guidance:**
- Problem: New users have no clear guidance on creating backups or recovering wallets
- Blocks: Enterprise wallet deployment. Regulatory compliance.

**No Transaction Signing Verification UI:**
- Problem: Users cannot independently verify transaction details before signing
- Blocks: Security audits. High-value transaction support.

**No Hardware Wallet Support:**
- Problem: All signing happens on-device. No option for external signing.
- Blocks: Institutional adoption. High security deployments.

**No Custom Electrum Peer Configuration:**
- Problem: Cannot specify custom Electrum servers. Hardcoded list only.
- Blocks: Private network deployments. Corporate firewall setups.

## Dependencies at Risk

**sql.js Maintenance:**
- Risk: sql.js is not heavily maintained. Newer SQLite versions have security fixes that won't reach sql.js quickly
- Impact: Security vulnerabilities in SQLite not patched in client
- Migration plan: Monitor for security advisories. Consider native SQLite binding if sql.js falls too far behind.

**@bitauth/libauth Type Compatibility:**
- Risk: Multiple UTXO type definitions across boundary with libauth. Breaking changes in libauth could require large refactoring.
- Impact: Version lock risk. Cannot upgrade libauth without major refactoring.
- Migration plan: Define canonical types in codebase. Create wrapper layer for libauth to absorb breaking changes.

**Capacitor Plugin Ecosystem Fragmentation:**
- Risk: Mix of official (@capacitor/) and community (@capacitor-community/) plugins. Community plugins may be abandoned.
- Impact: Plugin updates could break app. Biometric plugin (@capgo/capacitor-native-biometric) is community-maintained.
- Migration plan: Regularly audit plugin maintenance status. Have fallback implementations for critical plugins.

---

*Concerns audit: 2026-01-22*
