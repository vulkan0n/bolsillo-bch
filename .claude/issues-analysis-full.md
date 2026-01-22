# Selene Wallet Issues - Difficulty Analysis (291 Issues)
## Sorted by Milestone Priority, then Difficulty (with Claude Acceleration)

---

## 🔥 CRITICAL ISSUES (Fix ASAP - Any Milestone)

These block users regardless of milestone:

### Critical Bugs
1. **#585** - Send/Scan functions not working (not forwarding to Send page) | CRITICAL
   - **Difficulty:** MEDIUM (6-8h) - Navigation/routing bug
   - **Claude helps:** Debug flow, identify broken route handlers

2. **#549** - db corruption crash? | CRITICAL
   - **Difficulty:** VERY HARD (20-40h) - Data integrity issue
   - **Claude helps:** Analyze corruption patterns, suggest recovery strategies
   - **Needs human:** Deep database debugging, data recovery design

3. **#548** - App fails to load entirely (Splash screen never goes away) | CRITICAL
   - **Difficulty:** HARD (12-24h) - Boot sequence issue
   - **Claude helps:** Trace init sequence, identify blocking operations

4. **#544** - write some tests FFS | CRITICAL, HIGH PRIORITY, FREQUENTLY REQUESTED
   - **Difficulty:** VERY HARD (40-80h) - Test infrastructure
   - **Claude helps:** Generate test boilerplate, suggest test cases
   - **ROI:** EXTREMELY HIGH - prevents future bugs

---

## 📅 MILESTONE: v2025.12 [0E1C] - Assets Improvements
**Due: Dec 15, 2025 (IMMINENT/OVERDUE)** | 21 issues

### 🟢 EASIEST (Quick wins - 0.5-3h with Claude)

5. **#657** - Add "Welsh" (cy) as a language translation option
   - **Difficulty:** TRIVIAL (0.5h) - Add language code to config
   - **Claude:** Perfect for this - config file updates

6. **#656** - tx history filter clear icon overlaps text | BUG
   - **Difficulty:** EASY (1h) - CSS fix
   - **Claude:** Can iterate on CSS quickly

7. **#662** - [0.16] Feedback toast when scan content is found but invalid
   - **Difficulty:** EASY (1h) - Add toast notification
   - **Claude:** Find toast service pattern, add call

8. **#68** - [0.16] Long press QR code to get a nicely screenshottable preview
   - **Difficulty:** EASY (2h) - Long-press gesture + modal
   - **Claude:** Good at UI components

9. **#521** - Display receive tokens/coins QR code on Assets page
   - **Difficulty:** EASY (2h) - QR generation UI
   - **Claude:** Pattern matching from existing QR displays

10. **#534** - Ability to pin tokens
    - **Difficulty:** EASY (2-3h) - Preference array + sort logic
    - **Claude:** Good at list manipulation

11. **#531** - Ability to hide tokens from list
    - **Difficulty:** EASY (2-3h) - Preference array + filter
    - **Claude:** Similar to pin tokens

12. **#625** - Option to display sats on token utxos as part of spendable balance
    - **Difficulty:** EASY (2-3h) - Balance calculation display
    - **Claude:** Can find balance calculation logic

### 🟡 MEDIUM (3-8h with Claude)

13. **#629** - Ability to search/filter for tokens by symbol or name
    - **Difficulty:** MEDIUM (3-4h) - Search UI + filter logic
    - **Claude:** Good at search/filter patterns

14. **#645** - Always display Index 0 Address on Coin Control
    - **Difficulty:** MEDIUM (3-4h) - Address filtering logic
    - **Claude:** Can find address display code

15. **#578** - Option to view CashToken UTXOs in Coins Tab
    - **Difficulty:** MEDIUM (4-6h) - UTXO display with token data
    - **Claude:** Helpful for data mapping

16. **#610** - option to force sending tokens to a non-token address
    - **Difficulty:** MEDIUM (4-6h) - Override validation check
    - **Claude:** Can find validation logic

17. **#87** - App: Contacts; Add a simple contact list | FREQUENTLY REQUESTED
    - **Difficulty:** MEDIUM (6-8h) - CRUD UI for contacts
    - **Claude:** Good at CRUD scaffolding

### 🟠 MEDIUM-HARD (8-16h with Claude)

18. **#653** - Bugged repeating fingerprint transaction send scan | BUG
    - **Difficulty:** MEDIUM-HARD (6-12h) - Biometric flow bug
    - **Claude helps:** Trace biometric state management
    - **Needs human:** Security flow verification

19. **#649** - Switching from chipnet to mainnet breaks app state | BUG
    - **Difficulty:** MEDIUM-HARD (8-12h) - Network switching bug
    - **Claude helps:** Find state reset logic
    - **Needs human:** State management architecture

20. **#650** - PUSD launch requests | HIGH PRIORITY, BUG
    - **Difficulty:** MEDIUM-HARD (8-16h) - Critical token fixes
    - **Claude helps:** Debug specific issues
    - **Needs human:** Token protocol understanding

21. **#612** - handle BCMR NFT parse data | HIGH PRIORITY
    - **Difficulty:** HARD (12-16h) - NFT metadata parsing
    - **Claude helps:** JSON parsing logic
    - **Needs human:** BCMR spec understanding

### 🔴 HARD (16-40h with Claude)

22. **#665** - Add app load option to SecurityService | FREQUENTLY REQUESTED
    - **Difficulty:** HARD (12-20h) - App lifecycle + auth
    - **Claude helps:** Find auth integration points
    - **Needs human:** Security architecture decisions

23. **#495** - UTXO control for tokens
    - **Difficulty:** HARD (16-24h) - Coin control UI for tokens
    - **Claude helps:** UI scaffolding, UTXO selection logic
    - **Needs human:** UX design, transaction building logic

24. **#501** - NFT Details screen
    - **Difficulty:** HARD (16-24h) - Comprehensive NFT UI
    - **Claude helps:** Component generation, data display
    - **Needs human:** NFT metadata interpretation

25. **#441** - Transaction scheduler / "Cronjob" manager
    - **Difficulty:** VERY HARD (30-40h) - Background task system
    - **Claude helps:** Architecture suggestions
    - **Needs human:** Background execution design, permissions

---

## 📅 MILESTONE: v2026.01 [0E2C] - Stablecoin Mode Full Release / Vendor Mode
**Due: Jan 12, 2026 (VERY SOON)** | 25+ issues

### 🟢 EASIEST (Quick wins - 0.5-3h with Claude)

26. **#672** - Add Dunconomics tutorial video to Selene Explore page
    - **Difficulty:** TRIVIAL (0.5h) - Add video embed/link
    - **Claude:** Perfect for this

27. **#573** - Display amount requested more prominently on main Wallet screen
    - **Difficulty:** EASY (1-2h) - UI styling change
    - **Claude:** CSS/layout adjustments

28. **#617** - Improve Sweep screen
    - **Difficulty:** EASY (2-4h) - UI improvements
    - **Claude:** UI iteration

29. **#648** - Import wallets UI improvements
    - **Difficulty:** EASY (3-4h) - UI refactor
    - **Claude:** Component refactoring

### 🟡 MEDIUM (4-12h with Claude)

30. **#646** - Stablecoin swap threshold
    - **Difficulty:** MEDIUM (4-6h) - Preference + conditional logic
    - **Claude:** Good at threshold logic

31. **#632** - Stake and swap buttons directly on token pages
    - **Difficulty:** MEDIUM (4-6h) - Navigation + integration
    - **Claude:** Button placement + routing

32. **#652** - Consolidate related cashtokens with same base symbol
    - **Difficulty:** MEDIUM (6-8h) - Token grouping logic
    - **Claude:** Data transformation logic

33. **#569** - cache authchain transactions
    - **Difficulty:** MEDIUM (6-10h) - Caching layer
    - **Claude:** Cache implementation patterns

34. **#552** - count token utxos >1000 sats as part of wallet balance | HIGH PRIORITY
    - **Difficulty:** MEDIUM-HARD (8-12h) - Balance calculation logic
    - **Claude:** Find balance calculation, modify logic
    - **Needs human:** Economic implications

35. **#655** - Insufficient funds error with 0 BCH balance on sending tokens | BUG
    - **Difficulty:** MEDIUM-HARD (6-10h) - Error handling improvement
    - **Claude:** Error message logic

36. **#627** - Ability to burn tokens
    - **Difficulty:** MEDIUM-HARD (8-12h) - Burn transaction building
    - **Claude:** Transaction construction
    - **Needs human:** Verify burn is irreversible

37. **#626** - Support sending to P2SH addresses
    - **Difficulty:** MEDIUM-HARD (8-12h) - Address validation + tx building
    - **Claude:** Address parsing logic
    - **Needs human:** P2SH protocol details

### 🟠 HARD (12-30h with Claude)

38. **#493** - Send additional BCH with tokens
    - **Difficulty:** HARD (12-16h) - Transaction builder enhancement
    - **Claude:** Transaction logic modification
    - **Needs human:** UTXO selection strategy

39. **#494** - Send multiple tokens in one transaction
    - **Difficulty:** HARD (16-24h) - Complex transaction building
    - **Claude:** Transaction construction logic
    - **Needs human:** Multi-token transaction validation

40. **#644** - PayPro QR code receive payment standards implementation
    - **Difficulty:** HARD (16-24h) - BIP70 parsing + UI
    - **Claude:** Protocol parsing
    - **Needs human:** Payment protocol understanding

41. **#423** - Record fiat exchange rate to database for each block
    - **Difficulty:** HARD (12-20h) - Database schema + sync logic
    - **Claude:** Database queries, sync integration
    - **Needs human:** Data modeling

42. **#660** - Deploy Selenium testbed
    - **Difficulty:** HARD (16-30h) - Testing infrastructure
    - **Claude:** Test script generation
    - **Needs human:** CI/CD integration

### 🔴 VERY HARD (30+ hours even with Claude)

43. **#516** - Vendor Mode | MAJOR FEATURE
    - **Difficulty:** VERY HARD (40-80h) - New app mode
    - **Claude helps:** UI scaffolding, mode switching logic
    - **Needs human:** UX design, mode architecture

44. **#647** - Option to pay miner fees using token
    - **Difficulty:** VERY HARD (30-60h) - Protocol complexity
    - **Claude helps:** Research similar implementations
    - **Needs human:** BCH protocol deep knowledge

45. **#10** - CashFusion | MAJOR FEATURE
    - **Difficulty:** VERY HARD (80-160h) - Privacy protocol
    - **Claude helps:** Protocol research, integration patterns
    - **Needs human:** CashFusion protocol expertise, security audit

46. **#11** - Cash Register / Point of Sale Mode
    - **Difficulty:** VERY HARD (60-100h) - Complete new mode
    - **Claude helps:** UI generation, state management
    - **Needs human:** POS workflow design

47. **#317** - Opt-in donations to Selene devs | HIGH PRIORITY, Apple Legal
    - **Difficulty:** HARD (20-40h) - Payment flow + legal considerations
    - **Claude helps:** Payment UI, backend integration
    - **Needs human:** Legal compliance, Apple guidelines

48. **#325** - App: Fiat-denominated wallet economics
    - **Difficulty:** VERY HARD (40-80h) - Major feature
    - **Claude helps:** Calculation logic, UI
    - **Needs human:** Economic modeling

49. **#326** - App: Price history
    - **Difficulty:** HARD (20-30h) - Charts + data fetching
    - **Claude helps:** Chart component, API integration
    - **Needs human:** Data source selection

50. **#103** - Historical fiat tx values / exchange rate backend server
    - **Difficulty:** VERY HARD (40-80h) - Backend + frontend
    - **Claude helps:** API design, frontend integration
    - **Needs human:** Backend architecture, data storage

---

## 📅 MILESTONE: v2026.02 [0E3C] - CashFusion, i18n?
**Due: Feb 9, 2026** | 2 issues

51. **#675** - Updates to Welsh translations
    - **Difficulty:** TRIVIAL (0.25h) - Text replacement
    - **Claude:** Perfect for text updates

52. **#620** - [1] Maintain token exchange rates
    - **Difficulty:** HARD (20-30h) - API integration + caching
    - **Claude:** API integration patterns
    - **Needs human:** Rate source selection, update strategy

---

## 📅 MILESTONE: Localization (i18n) improvements
**Due: Feb 11, 2026** | 15 issues

53. **#658** - Fix translation script | BUG
    - **Difficulty:** MEDIUM (4-8h) - Debug Node.js script
    - **Claude:** Excellent at debugging scripts

54. **#674** - ability to choose date format for history
    - **Difficulty:** EASY (2-3h) - Preference + display formatting
    - **Claude:** Date formatting logic

55. **#568** - Support for Columbian Peso (COP)
    - **Difficulty:** TRIVIAL (0.5h) - Add to currency list
    - **Claude:** Perfect

56. More i18n issues (languages, formats, RTL support)
    - **Difficulty:** Varies EASY to MEDIUM (1-8h each)
    - **Claude:** Excellent for internationalization patterns

---

## 📅 MILESTONE: More Wallet Improvements
**Due: Mar 30, 2026** | 55+ issues

I'll highlight key ones sorted by difficulty:

### Easy Wins
57. **#640** - Better detection of BCH addresses embedded in text (2-3h)
58. **#551** - show fee on tx explorer (2h)
59. **#643** - Persist custom fulcrum servers (2-3h)
60. **#535** - CashConnect support (Research Required)
61. **#631** - Instant Sweep (8-12h)
62. **#595** - "Consolidate UTXOs" button for walletconnect (6-10h)
63. **#604** - Register OS-level wc: URI handler (6-12h)
64. **#609** - Option to disable instant pay for URL/NFC app entry (4-6h)
65. **#615** - Support for TapSwap (20-40h)
66. **#545** - Ability to select WalletConnect address (8-12h)
67. **#575** - Multi-modal Selene (60-120h - MAJOR)
68. **#530** - Double spend proof support (30-50h)

---

## 📅 MILESTONE: v2026.YY - Utilities
**Due: Mar 31, 2026** | 13+ issues

69. **#618** - Address management tool / static address tool (12-20h)
70. **#624** - Explorer widgets (20-30h)
71. **#518** - App: QR Code Generator (8-16h)
72. **#532** - App: MFA Code Generator (TOTP/HOTP) (20-30h)
73. **#553** - App: BCashGPT (40-80h - AI integration)
74. **#478** - Address Scan/Calculator tool (6-10h)
75. **#479** - App: Address Conversion Tool (4-8h)
76. **#460** - Database viewer debug tool (16-24h)

---

## 📅 MILESTONE: v2026.YY - Triage / Short Term
**Due: Dec 31, 2026** | 102 issues

This contains a mix of everything. Key highlights:

### Quick Wins
77. **#666** - Add milestones to stats timeline (2-4h)
78. **#670** - Prefilled instant send (4-6h)
79. **#550** - Warn when switching to BCH denomination for first time (1-2h)

### Critical Bugs
80. **#583** - Camera not loading? (8-16h)
81. **#582** - PIN/Password entry being autocompleted (4-8h)
82. **#592** - support Android 15+ edge to edge mode (16-30h)
83. **#636** - Loading more tx history blocks UI (12-20h)
84. **#637** - BCMR download soft-crashing on iOS (12-20h)
85. **#661** - chversion fails to update $MARKETING_VERSION (8-12h)

### Major Features
86. **#671** - Option to pay for "postage" when sending tokens (8-12h)
87. **#673** - Subscribe to BCMR authhead UTXOs (12-16h)
88. **#663** - FBCH Metadata parsing (16-24h)
89. **#668** - Add Near Intents for swapping in/out of BCH (40-80h)
90. **#667** - Automate BCH Bank Run (30-60h)
91. **#659** - End of year user engagement recap "Wrapped Selene 202x" (20-40h)
92. **#634** - Chipnet faucet (16-30h)
93. **#633** - Wrapped BCH (30-60h)
94. **#613** - Add "Sent-transaction export" for offline broadcasting (12-20h)
95. **#605** - Document the behaviour of Google Play/iCloud automatic backups (8-16h)
96. **#572** - Pay via NFC (30-50h)
97. **#563** - Wallet Backup NFC Card (30-50h)
98. **#566** - force a minimum amount of contrast for QR colors (6-10h)
99. **#567** - Inconsistent QR scan behavior - byte order mark fails (8-12h)
100. **#559** - Offline Transactions (60-100h)
101. **#558** - Add Molecular's fulcrum instance to default server list (0.5h)
102. **#557** - Ability to airdrop tokens to a mailing list (30-50h)
103. **#540** - Add a network stats dashboard including node count (30-50h)
104. **#539** - Home screen widget (40-80h)

---

## 📅 MILESTONE: v2025.YY - BCMR Improvements
**Due: Mar 3, 2026** | 5 issues

105. **#628** - Ability to manually enter token metadata for unresolved BCMR (12-16h)
106. **#576** - progress bar for token data resolution (6-10h)
107. **#538** - Token metadata profanity filtering (20-40h)
108. **#520** - BCMR authchain acceleration (16-30h)
109. **#519** - BCMR Icon caching (12-20h)

---

## 📅 MILESTONE: Technical Debt
**Due: Dec 31, 1999 (HIGH PRIORITY BACKLOG)** | 15 issues

110. **#2** - Tests (40-80h) - CRITICAL
111. **#215** - Automated Sanity Testing / UI Testing (60-100h) - CRITICAL
112. **#310** - write tests for UtxoService.selectUtxos (8-16h)
113. **#3** - Build Automation (30-60h)
114. **#234** - Document code standards, design guidelines (20-40h)
115. **#235** - Document CI/CD pipeline + build/release process (16-30h)
116. **#242** - Document Testing/QA guidelines (12-20h)
117. **#211** - Fastlane: Screenshots for Android/iOS (20-40h)
118. **#599** - migrate to libauth bip39 to simplify dependency graph (12-20h)
119. **#596** - Security/threat analysis of downloading token metadata (40-80h) - HIGH PRIORITY
120. **#513** - update deprecated barcode-scanner to new Capacitor plugin (16-30h)
121. **#571** - upgrade to tailwindcss v4 (20-40h) - BLOCKED
122. **#462** - Investigate Apple iCloud backups (30-60h)
123. **#419** - Migrate from Capacitor to Tauri v2 (200-400h) - MASSIVE
124. **#375** - move flushDatabase to IO service worker (20-40h)

---

## 📅 MILESTONE: v20XX.YY - Triage / Long Term
**Due: Apr 18, 2092** | 49 issues (Future/Research)

These require significant research or are blocked:

125. **#600** - Support for Quantumroot wallet template (80-160h) - BLOCKED, Research Required
126. **#597** - Recurring payments/subscriptions (60-120h) - Research Required
127. **#536** - CashRPC (80-160h) - Research Required
128. **#591** - Electrum service worker / NetworkManager (60-100h) - Architecture refactor
129. **#453** - Shamir-based Seed Backup / Social Recovery (60-120h)
130. **#464** - Encrypt wallet files (40-80h)
131. **#465** - Online Wallet Backup (60-100h)
132. **#533** - App: password manager (60-100h)
133. **#560** - pkpass format? (Research Required)
134. **#492** - CashScript (100-200h) - MAJOR
135. **#445** - Tor Support (80-160h) - MAJOR
136. **#442** - Support for Monero (XMR) Atomic Swaps (100-200h) - MAJOR
137. **#440** - Investigate In-App Browser options (30-60h)
138. Plus many more large research items...

---

## 📅 OTHER MILESTONES

**Social Features (BChat)** - Due: Feb 23, 2026
- 8 issues related to BChat/nostr integration
- Mostly HARD to VERY HARD (30-80h each)

**v2026.YY - Maps** - Due: Aug 31, 2026
- 4 issues related to map features
- GeoZapping, merchant maps, etc.
- MEDIUM to HARD (20-60h each)

**Website / Merch Page** - Due: Jun 15, 2024 (PAST DUE)
- 3 issues for website updates
- EASY to MEDIUM (4-20h each)

**v2025.YY - Transaction History Improvements** - Due: Oct 28, 2025 (PAST DUE)
- 2 issues
- EASY (#481: 1-2h, #623: 4-6h)

**v2025.10 - Stablecoin & Dark Mode** - Due: Oct 31, 2025 (PAST DUE)
- 2 issues
- #585 (CRITICAL bug, 6-8h)
- #590 (Stablecoin Support - MAJOR, 60-120h)

---

# 🎯 RECOMMENDED ATTACK PLAN WITH CLAUDE

## Phase 1: Build Momentum (Week 1)
**Target: v2025.12 milestone - Quick wins**

1. #657 - Add Welsh language (0.5h)
2. #656 - Fix tx history filter icon overlap (1h)
3. #662 - Toast for invalid scan content (1h)
4. #521 - QR code on Assets page (2h)
5. #534 - Ability to pin tokens (2-3h)
6. #531 - Ability to hide tokens (2-3h)
7. #625 - Display sats on token UTXOs (2-3h)
8. #68 - Long press QR preview (2h)

**Total: ~12-16 hours → 8 PRs merged**
**Claude acceleration: 2-3x faster than solo**

## Phase 2: Medium Features (Week 2-3)
**Target: v2025.12 + v2026.01 milestones**

9. #629 - Token search/filter (3-4h)
10. #645 - Display Index 0 on Coin Control (3-4h)
11. #672 - Add Dunconomics video (0.5h)
12. #573 - Prominent amount display (1-2h)
13. #646 - Stablecoin swap threshold (4-6h)
14. #632 - Stake/swap buttons on token pages (4-6h)
15. #617 - Improve Sweep screen (2-4h)
16. #648 - Import wallets UI improvements (3-4h)

**Total: ~21-35 hours → 8 PRs**

## Phase 3: Critical Bugs (Week 3-4)
**HIGH IMPACT**

17. #653 - Fingerprint bug (6-12h)
18. #655 - Insufficient funds error (6-10h)
19. #649 - Network switching bug (8-12h)
20. #585 - Send/Scan not working (6-8h) - CRITICAL
21. #583 - Camera not loading (8-16h)

**Total: ~34-58 hours → 5 critical fixes**
**ROI: VERY HIGH - improves user experience dramatically**

## Phase 4: High-Value Features (Month 2)
**Target: v2026.01 milestone**

22. #650 - PUSD launch requests (8-16h) - HIGH PRIORITY
23. #612 - BCMR NFT parse data (12-16h) - HIGH PRIORITY
24. #552 - Count token UTXOs in balance (8-12h) - HIGH PRIORITY
25. #627 - Ability to burn tokens (8-12h)
26. #626 - Support P2SH addresses (8-12h)
27. #569 - Cache authchain transactions (6-10h)
28. #652 - Consolidate related tokens (6-8h)

**Total: ~56-86 hours → 7 high-value features**

## Phase 5: Major Features (Month 3+)
**NEGOTIATE BOUNTIES**

29. #665 - App load security option (12-20h) - FREQUENTLY REQUESTED
30. #495 - UTXO control for tokens (16-24h)
31. #501 - NFT Details screen (16-24h)
32. #493 - Send additional BCH with tokens (12-16h)
33. #494 - Send multiple tokens (16-24h)
34. #644 - PayPro QR standards (16-24h)
35. #423 - Record fiat exchange rates (12-20h)

**Total: ~100-152 hours → 7 major features**

## Phase 6: Critical Infrastructure
**HIGHEST PRIORITY LONG-TERM**

36. #544 - Write tests (40-80h) - CRITICAL
37. #660 - Deploy Selenium testbed (16-30h)
38. #215 - Automated UI Testing (60-100h)

**Total: ~116-210 hours**
**ROI: MASSIVE - prevents regressions, enables faster development**

---

# 💡 CLAUDE CODE ACCELERATION STRATEGIES

## Where Claude EXCELS:
- ✅ Quick UI tweaks (#656, #573, #521)
- ✅ Config changes (#657, #558)
- ✅ Search/filter logic (#629, #640)
- ✅ CRUD operations (#534, #531, #87)
- ✅ Toast/notification patterns (#662)
- ✅ List manipulation/sorting (#534, #531, #652)
- ✅ Form validation (#655, #626)
- ✅ CSS/styling fixes (#656, #573)
- ✅ Date formatting (#674)
- ✅ Currency conversions (#568, #488)
- ✅ Test generation (#544, #310)

## Where Claude HELPS (with oversight):
- ⚠️ Transaction building (#493, #494, #627)
- ⚠️ Balance calculations (#552, #625)
- ⚠️ Caching logic (#569, #519)
- ⚠️ API integrations (#620, #423)
- ⚠️ Navigation/routing (#585, #604)
- ⚠️ Component refactoring (#648, #617)
- ⚠️ Protocol parsing (#644, #663)

## Where YOU Must Lead (Claude assists):
- ❌ Security architecture (#665, #596, #464)
- ❌ Key management (any private key work)
- ❌ Database migrations (#549, #635)
- ❌ App lifecycle changes (#665, #419)
- ❌ Major features (#516, #575, #10)
- ❌ Protocol implementations (#10, #492, #445)
- ❌ Legal/compliance (#317, #462)

---

# 📊 SUMMARY STATISTICS

- **Total Open Issues:** 291
- **Trivial (0-1h):** ~15 issues
- **Easy (1-4h):** ~45 issues
- **Medium (4-12h):** ~75 issues
- **Medium-Hard (12-20h):** ~50 issues
- **Hard (20-40h):** ~60 issues
- **Very Hard (40+ hours):** ~46 issues

**Best Quick Wins (First 20 issues):**
- Estimated: 30-50 hours with Claude
- High visibility improvements
- Build familiarity with codebase
- Demonstrate value to project

**Critical Path (Bugs + Infrastructure):**
- 10-15 critical issues
- Estimated: 200-400 hours with Claude
- Massive impact on stability and development velocity

---

# 🎖️ PRIORITY TIERS FOR YOU

## Tier 1: Immediate (This Week)
Focus on v2025.12 milestone (overdue) + critical bugs
- Issues: #657, #656, #662, #521, #534, #531, #625, #585
- Time: ~15-25 hours with Claude
- Value: Quick wins + critical bug fix

## Tier 2: Short-term (Next 2-3 weeks)
v2025.12 completion + v2026.01 start + critical bugs
- Issues: #629, #645, #653, #655, #649, #672, #573, #646
- Time: ~40-70 hours with Claude
- Value: Milestone completion + stability

## Tier 3: Medium-term (Next 1-2 months)
v2026.01 milestone focus
- Issues: #650, #612, #552, #627, #626, #632, #569, #652
- Time: ~60-100 hours with Claude
- Value: High-priority features for stablecoin/vendor mode

## Tier 4: Long-term (2-3 months)
Major features + infrastructure
- Issues: #665, #495, #501, #516, #544, #660
- Time: ~140-200 hours with Claude
- Value: Major capabilities + test infrastructure

## Tier 5: Strategic (3-6 months)
Ecosystem features
- Issues: #10, #575, #620, #423, #103
- Time: ~200-400 hours with Claude
- Value: Major ecosystem additions (CashFusion, multi-modal, etc.)

---

**READY TO START? Pick from Tier 1 and let's build!** 🚀
