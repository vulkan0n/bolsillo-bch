/**
 * Unit tests for LocalNotificationService
 *
 * Tests the notification scheduling logic:
 * - Dust threshold (< 546 sats) suppression
 * - Foreground guard (App.getState isActive)
 * - Background notification scheduling
 * - Balance snapshot for resume aggregation
 * - Cold start path (no snapshot)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

import LocalNotificationService from "./LocalNotificationService";

const DUST_THRESHOLD = 546n;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LocalNotificationService", () => {
  describe("schedulePaymentReceived", () => {
    it("suppresses notification for amounts below 546 sat dust threshold", async () => {
      const svc = LocalNotificationService();
      await svc.schedulePaymentReceived(100n);

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("suppresses notification when app is in foreground (isActive: true)", async () => {
      vi.mocked(App.getState).mockResolvedValue({ isActive: true });

      const svc = LocalNotificationService();
      await svc.schedulePaymentReceived(10000n);

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("schedules notification when app is in background (isActive: false)", async () => {
      vi.mocked(App.getState).mockResolvedValue({ isActive: false });

      const svc = LocalNotificationService();
      await svc.schedulePaymentReceived(10000n);

      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
      expect(LocalNotifications.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              title: "Pago recibido",
            }),
          ]),
        })
      );
    });

    it("contains the formatted BCH amount in the notification body", async () => {
      vi.mocked(App.getState).mockResolvedValue({ isActive: false });

      const svc = LocalNotificationService();
      await svc.schedulePaymentReceived(100000n);

      expect(LocalNotifications.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              body: expect.stringContaining("0.001"),
            }),
          ]),
        })
      );
    });

    it("uses correct BCH channel ID", async () => {
      vi.mocked(App.getState).mockResolvedValue({ isActive: false });

      const svc = LocalNotificationService();
      await svc.schedulePaymentReceived(10000n);

      expect(LocalNotifications.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              channelId: "bch-payments",
            }),
          ]),
        })
      );
    });
  });

  describe("incrementPendingTx / resetPendingTx / hasPendingNotifications", () => {
    it("increments pending tx count and total", () => {
      const svc = LocalNotificationService();

      expect(svc.hasPendingNotifications()).toBe(false);

      svc.incrementPendingTx(10000n);
      expect(svc.hasPendingNotifications()).toBe(true);

      svc.incrementPendingTx(20000n);
      expect(svc.hasPendingNotifications()).toBe(true);

      svc.resetPendingTx();
      expect(svc.hasPendingNotifications()).toBe(false);
    });
  });

  describe("scheduleAggregatedNotification", () => {
    it("fires notification when pending total exceeds dust threshold", async () => {
      const svc = LocalNotificationService();
      svc.incrementPendingTx(10000n);
      svc.incrementPendingTx(20000n);

      await svc.scheduleAggregatedNotification();

      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
      expect(LocalNotifications.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              title: "Pagos recibidos",
              body: expect.stringContaining("0.0003"),
            }),
          ]),
        })
      );
    });

    it("does not fire when pending total is below dust threshold", async () => {
      const svc = LocalNotificationService();
      svc.incrementPendingTx(100n);

      await svc.scheduleAggregatedNotification();

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("does not fire when there are no pending notifications", async () => {
      const svc = LocalNotificationService();

      await svc.scheduleAggregatedNotification();

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("resets pending tx after firing aggregated notification", async () => {
      const svc = LocalNotificationService();
      svc.incrementPendingTx(10000n);

      await svc.scheduleAggregatedNotification();
      expect(svc.hasPendingNotifications()).toBe(false);
    });
  });

  describe("captureBalanceSnapshot / checkResumeNotification", () => {
    it("fires aggregated notification when balance increased above threshold", async () => {
      const svc = LocalNotificationService();

      svc.incrementPendingTx(20000n);
      svc.captureBalanceSnapshot(100000n);
      await svc.checkResumeNotification(120000n);

      // Balance diff = 20000, pending total = 20000 → fires aggregated
      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
      expect(LocalNotifications.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              title: "Pagos recibidos",
            }),
          ]),
        })
      );
    });

    it("does not fire when balance diff is below dust threshold", async () => {
      const svc = LocalNotificationService();

      svc.captureBalanceSnapshot(100000n);
      await svc.checkResumeNotification(100100n);

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("does not fire when there is no snapshot (cold start)", async () => {
      const svc = LocalNotificationService();

      await svc.checkResumeNotification(100000n);

      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it("clears snapshot and pending counters after check", async () => {
      const svc = LocalNotificationService();

      svc.incrementPendingTx(10000n);
      svc.captureBalanceSnapshot(100000n);
      await svc.checkResumeNotification(110000n);

      // Snapshot cleared
      expect(svc.getBalanceSnapshot()).toBeNull();
      // Pending reset
      expect(svc.hasPendingNotifications()).toBe(false);
    });
  });
});
