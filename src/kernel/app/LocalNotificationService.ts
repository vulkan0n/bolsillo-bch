import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import { satsToBch } from "@/util/sats";

// --------------------------------
// Constants

const DUST_THRESHOLD = 546n;

const CHANNEL_ID = "bch-payments";
const CHANNEL_NAME = "Pagos BCH";

const RESUME_DELAY_MS = 8000;

// --------------------------------
// Module-level state

let _pendingTxCount = 0;
let _pendingTotal = 0n;
let _balanceSnapshot: bigint | null = null;
let _notificationIdCounter = 0;
let _channelCreated = false;
let _hasRequestedPermission = false;
let _permissionGranted = false;

// --------------------------------
// Helpers

function nextNotificationId(): number {
  _notificationIdCounter += 1;
  return _notificationIdCounter;
}

function formatBch(amount: bigint): string {
  return satsToBch(amount).bch.replace(/\.?0+$/, "");
}

async function ensureChannel() {
  if (_channelCreated) return;
  if (Capacitor.getPlatform() !== "android") {
    _channelCreated = true;
    return;
  }

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: 5, // IMPORTANCE_HIGH
      visibility: 1, // VISIBILITY_PUBLIC
      sound: "default",
      vibration: true,
    });
  } catch {
    // Non-critical — Capacitor's default channel still works
  }
  _channelCreated = true;
}

async function ensurePermission(): Promise<boolean> {
  if (_hasRequestedPermission) return _permissionGranted;

  const platform = Capacitor.getPlatform();
  if (platform !== "android") {
    // iOS/macOS/web: no runtime permission required for local notifications
    _hasRequestedPermission = true;
    _permissionGranted = true;
    return true;
  }

  try {
    const { display } = await LocalNotifications.checkPermissions();

    if (display === "granted") {
      _hasRequestedPermission = true;
      _permissionGranted = true;
      return true;
    }

    if (display === "denied") {
      _hasRequestedPermission = true;
      _permissionGranted = false;
      return false;
    }

    // "prompt" — request once
    const result = await LocalNotifications.requestPermissions();
    _permissionGranted = result.display === "granted";
    _hasRequestedPermission = true;
    return _permissionGranted;
  } catch {
    // If permission check fails, assume granted to avoid blocking notifications
    _hasRequestedPermission = true;
    _permissionGranted = true;
    return true;
  }
}

// --------------------------------
// Service API

export default function LocalNotificationService() {
  return {
    schedulePaymentReceived,
    incrementPendingTx,
    resetPendingTx,
    hasPendingNotifications,
    scheduleAggregatedNotification,
    captureBalanceSnapshot,
    getBalanceSnapshot,
    checkResumeNotification,
  };

  /**
   * Fires an individual local notification for a received payment.
   * Suppressed if the app is in foreground (in-app toast handles it).
   * Passes through dust threshold (< 546 sats) silently.
   */
  async function schedulePaymentReceived(amount: bigint): Promise<void> {
    if (amount < DUST_THRESHOLD) return;

    // Suppress if foreground — the in-app toast already fires
    try {
      const state = await App.getState();
      if (state.isActive) return;
    } catch {
      // If we can't determine state, proceed with notification
    }

    await ensureChannel();
    const granted = await ensurePermission();
    if (!granted) return;

    const formatted = formatBch(amount);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Pago recibido",
            body: `Recibiste ${formatted} BCH`,
            id: nextNotificationId(),
            channelId: CHANNEL_ID,
            schedule: { at: new Date() },
          },
        ],
      });
    } catch {
      // Non-critical — silent fail
    }
  }

  /**
   * Increments the pending tx counter and running total.
   * Called from walletReceive when app is backgrounded.
   */
  function incrementPendingTx(amount: bigint) {
    _pendingTxCount += 1;
    _pendingTotal += amount;
  }

  /**
   * Resets the pending tx counter and running total.
   */
  function resetPendingTx() {
    _pendingTxCount = 0;
    _pendingTotal = 0n;
  }

  /**
   * Returns true if there are pending txs accumulated since last reset.
   */
  function hasPendingNotifications(): boolean {
    return _pendingTxCount > 0;
  }

  /**
   * Fires a single aggregated notification reporting total amount
   * received during background + resume intervals.
   * Does NOT check foreground state — this is an intentional
   * heads-up on resume even if the app is active.
   */
  async function scheduleAggregatedNotification(): Promise<void> {
    if (_pendingTxCount === 0 || _pendingTotal < DUST_THRESHOLD) {
      resetPendingTx();
      return;
    }

    await ensureChannel();
    const granted = await ensurePermission();
    if (!granted) {
      resetPendingTx();
      return;
    }

    const formatted = formatBch(_pendingTotal);
    resetPendingTx();

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Pagos recibidos",
            body: `Recibiste ${formatted} BCH mientras estabas ausente`,
            id: nextNotificationId(),
            channelId: CHANNEL_ID,
            schedule: { at: new Date() },
          },
        ],
      });
    } catch {
      // Non-critical — silent fail
    }
  }

  /**
   * Captures the current wallet balance as a snapshot for later comparison.
   * Called from redux_pause().
   */
  function captureBalanceSnapshot(balance: bigint) {
    _balanceSnapshot = balance;
  }

  /**
   * Returns the stored balance snapshot, or null if not set.
   */
  function getBalanceSnapshot(): bigint | null {
    return _balanceSnapshot;
  }

  /**
   * Compares the current balance with the snapshot. If the difference
   * exceeds the dust threshold, fires an aggregated notification using
   * the accumulated pending tx data. Called from redux_resume().
   *
   * Clears the snapshot and pending counters regardless of outcome.
   */
  async function checkResumeNotification(
    currentBalance: bigint
  ): Promise<void> {
    const snapshot = _balanceSnapshot;
    _balanceSnapshot = null;

    if (snapshot === null) {
      // No snapshot (e.g., cold start) — skip aggregated notification;
      // txs appear as individual toasts during foreground sync
      resetPendingTx();
      return;
    }

    const diff = currentBalance - snapshot;
    if (diff < DUST_THRESHOLD) {
      resetPendingTx();
      return;
    }

    // Use the accumulated pending data if available; otherwise fall back
    // to the balance diff for the total amount
    if (_pendingTxCount > 0) {
      await scheduleAggregatedNotification();
    } else {
      // No pending tx counter (e.g., app was killed, balance changed on
      // re-sync) — fire aggregated with just the balance diff
      if (diff >= DUST_THRESHOLD) {
        await ensureChannel();
        const granted = await ensurePermission();
        if (!granted) return;

        const formatted = formatBch(diff);

        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Pagos recibidos",
                body: `Recibiste ${formatted} BCH mientras estabas ausente`,
                id: nextNotificationId(),
                channelId: CHANNEL_ID,
                schedule: { at: new Date() },
              },
            ],
          });
        } catch {
          // Non-critical
        }
      }
    }

    resetPendingTx();
  }
}
