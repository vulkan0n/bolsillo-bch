# MR !235 Fix Plan

**Source:** Five-reviewer code review (Linus, Shadow Wizard, Code Sniffer, Pragmatic, Moth)
**Branch:** `pin-modal`
**Date:** 2026-03-18

## Reviewer Consensus Notes

- **ModalProvider singleton**: Moth confirmed the dual-mount pattern is safe — only one provider alive at a time (MainLayout for RUNNING, AppLockScreen for pre-auth). The render-body assignment is fine because React guarantees render runs before any effect that could trigger a modal. **Demoted from critical to dismissed.**
- **coldStart AppOpen behavior change**: Moth flagged this as a silent behavior change worth calling out in the MR description for QA. Old: lock iff `!isKeyLoaded`. New: also locks when `authActions.includes(AppOpen)`.
- **pattern on type="password"**: Moth's unique find — browsers silently ignore `pattern` validation on password inputs, so numeric PIN fields accept any characters on desktop.

## Fix Order

Grouped by commit scope. Critical security fixes first, then correctness, then cleanup.

---

### Commit 1: `fix: WalletConnect signing security issues`

**Files:** `src/redux/walletConnect.ts`

- [ ] **#1 — Add `return` after user rejection in `bch_signTransaction` (line 130)**
  - After sending `USER_REJECTED` response, add `return;` so signing code doesn't execute
  - This is a security regression — transaction is signed despite user declining

- [ ] **#2 — Add user prompt to `bch_signMessage` (line 183)**
  - Add `showConfirm` call before signing, matching the pattern from `bch_signTransaction`
  - Include peer metadata name, message preview, and origin in the prompt
  - Send `USER_REJECTED` and return if user declines

- [ ] **#3 — Fix `wcSessionProposal` fallthrough on network mismatch (line 72)**
  - Add `return;` after `thunkApi.dispatch(wcSessionReject(proposal))` so approval doesn't also fire on wrong network

---

### Commit 2: `fix: ModalService cleanup`

**Files:** `src/kernel/app/ModalService.tsx`

- [ ] **#11 — Remove redundant `!` non-null assertions (lines 51, 60)**
  - `pushModal!({...})` → `pushModal({...})` — already narrowed by the null guard above

- [ ] **#16 — Fix modal queue to be FIFO, not LIFO**
  - Currently renders `modals[modals.length - 1]` (last pushed = first shown)
  - Change to render `modals[0]` and dismiss index 0 (first pushed = first shown, dismiss reveals next in line)

~~#5 pushModal in render body~~ — Dismissed per Moth: render-body assignment is safe here. Only one provider alive at a time. React guarantees render before effects.

---

### Commit 3: `fix: AppProvider error handling and dark mode`

**Files:** `src/kernel/app/AppProvider.tsx`

- [ ] **#6 — Preserve original Error in startupError**
  - `setStartupError(new Error(String(e)))` → `setStartupError(e instanceof Error ? e : new Error(String(e)))`
  - Apply in both `boot()` catch and `coldStart()` catch blocks

- [ ] **#10 — Move dark mode class to useEffect**
  ```typescript
  useEffect(function applyDarkMode() {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);
  ```
  - Remove the bare DOM manipulation from the render body (lines 213-218)

---

### Commit 4: `fix: stale comments, dead code, duplicate lint suppression`

**Files:** Multiple

- [ ] **#7 — Remove duplicate eslint-disable in ForgotPinScreen.tsx (line 2)**
  - Delete the second `/* eslint-disable react-refresh/only-export-components */`

- [ ] **#8 — Update stale BootProvider comment in SecurityService.ts (line 127)**
  - `"Called by BootProvider on pause"` → `"Called by AppProvider on pause"`

- [ ] **#9 — Single ModalProvider in AppProvider + migrate ErrorBoundary**
  - Mount `<ModalProvider />` once in AppProvider, above the phase switch (always available)
  - Remove `<ModalProvider />` from MainLayout.jsx
  - Remove `<ModalProvider />` from AppLockScreen.tsx
  - In ErrorBoundary.tsx `StartupErrorBoundary`: replace `Dialog.confirm` with `ModalService().showConfirm`
  - Remove `@capacitor/dialog` import — fully eliminated from the codebase
  - ModalProvider doesn't need router context — callers handle navigation in their own scope after the promise resolves

- [ ] **#18 — Remove dead wrapper in SecuritySettings.jsx (line 180)**
  - Delete `const promptForNewPin = () => Security.promptForNewPin();`
  - Update call sites (lines 206, 216) to use `Security.promptForNewPin()` directly

- [ ] **#20 — Remove redundant `= undefined` defaults**
  - ConfirmModal.tsx: remove `= undefined` from optional props
  - PromptModal.tsx: remove `= undefined` from optional props

---

### Commit 5: `fix: PromptModal validation, empty submission, and button props`

**Files:** `src/components/composite/PromptModal.tsx`, `src/components/composite/ConfirmModal.tsx`, `src/components/views/security/ForgotPinScreen.tsx`

- [ ] **#15 — Disable submit on empty value in PromptModal**
  - Add `disabled={!value.trim()}` to the submit Button (or guard in handleSubmit)

- [ ] **#14 — Extract shared button style props**
  - Create `src/components/composite/modalButtonStyles.ts` with:
    - `cancelButtonProps`
    - `confirmButtonProps` (primary action)
    - `dangerButtonProps`
  - Import in ConfirmModal, PromptModal, and ForgotPinScreen
  - Remove local duplicates

- [ ] **#24 — Simplify inputMode conditional in PromptModal (line 78)**
  - `inputMode={inputMode === "numeric" ? "numeric" : undefined}` → `inputMode={inputMode}`

---

### Commit 6: `fix: SecurityService cleanup`

**Files:** `src/kernel/app/SecurityService.ts`

- [ ] **#12 — Add wrong-PIN feedback in `authorizeLegacyPin`**
  - After hash comparison fails (line 233 else), add `NotificationService().error(translate(common.incorrectPin));`

- [ ] **#17 — Promote `MIN_PASSWORD_LENGTH` to module level**
  - Move `const MIN_PASSWORD_LENGTH = 8;` from inside `promptForNewPin` to module scope

- [ ] **#22 — Fix section divider spacing**
  - `// --- PIN management  ---` → `// --------------------------------` (match project convention)
  - Same for `// --- Biometric  ---`

---

### Commit 7: `chore: minor polish`

**Files:** Various

- [ ] **#21 — Add `debug` translation key to common.js**
  - Replace inline `{ en: "Debug" }` in SecurityService.ts:48 with `common.debug`

- [ ] **#23 — Extract biometric button styles in AppLockScreen**
  - Create named `secondaryButtonProps` constant for the conditional biometric button styling

- [ ] **#26 — Add comment to Overlay.tsx fallback**
  - Explain why `#root` fallback exists (pre-auth screens where `#container` isn't mounted)

---

### Pre-merge (not committed, run manually):

- [ ] **#4 — Revert `file:` plugin reference in package.json**
  - Change back to git tag: `https://git.xulu.tech/selene.cash/capacitor-plugin-simple-encryption.git#vX.Y.Z`
  - Depends on publishing the plugin changes first

- [ ] **#19 — Run `addLanguages.js` for new translation keys**
  - `GOOGLE_TRANSLATE_API_KEY="xxx" node ./automation/addLanguages.js`
  - 14+ new English-only keys need translation

- [ ] **#M2 — Update MR description (Moth)**
  - Call out the `coldStart` behavior change: now locks on AppOpen auth action even when key loaded successfully

---

### Dismissed

- ~~**#5 — pushModal in render body**~~ — Moth confirmed safe. Only one provider alive at a time. Render-body assignment guaranteed to run before any triggering effect.
- ~~**#13 — Single ModalProvider architecture**~~ — Moth confirmed dual-mount is correct by design.
- **#3 (partial)** — WalletConnect session auto-approve — approval is implicit from user pressing "pair" button
- **#25** — init.jsx vs Main.jsx entrypoint separation (taste, not broken)
- **Scope split** — Pragmatic reviewer suggested 3 separate MRs. Ship as-is since it's a solo dev project.
- **#M1 — Numeric PIN validation (Moth)** — PIN vs password is cosmetic. Users can secure keys with whatever they want. No validation needed.
- **#M3 — promptForNewPin retry loop (Moth)** — Current behavior (toast + return null, caller re-invokes) is acceptable UX. Not worth the complexity of a retry loop here.
