import { useCallback, useContext } from "react";
import { useSelector } from "react-redux";

import { selectIsStablecoinMode } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import ModalService from "@/kernel/app/ModalService";
import NotificationService from "@/kernel/app/NotificationService";
import CauldronService from "@/kernel/bch/CauldronService";
import UtxoManagerService from "@/kernel/wallet/UtxoManagerService";

import Accordion from "@/atoms/Accordion";
import Checkbox from "@/atoms/Checkbox";

import { PUSD_TOKENID, STABLE_RESERVE_PCT } from "@/util/tokens";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SettingsContext } from "./SettingsContext";

export default function StableSettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const isStablecoinMode = useSelector(selectIsStablecoinMode);
  const activeWallet = useSelector(selectActiveWallet);
  const Modal = ModalService();
  const Notification = NotificationService();

  const handleToggle = useCallback(async () => {
    if (!activeWallet) return;

    if (isStablecoinMode) {
      // ---------------- Deactivation ----------------
      const isConfirmed = await Modal.showConfirm({
        title: translate(translations.modoEstableDeactivationTitle),
        message: translate(translations.modoEstableDeactivationMessage),
      });
      if (!isConfirmed) return;

      handleSettingsUpdate("stablecoinMode", "false");
      Notification.success(
        translate(translations.modoEstableDeactivationSuccess)
      );

      // Best-effort PUSD→BCH deactivation swap
      try {
        const Cauldron = CauldronService();
        const UtxoManager = UtxoManagerService(activeWallet.walletHash);
        const pusdUtxos = UtxoManager.getCategoryUtxos(PUSD_TOKENID);
        const pusdBalance = pusdUtxos.reduce(
          (sum, u) => sum + (u.token_amount ?? 0n),
          0n
        );

        if (pusdBalance > 0n) {
          await Cauldron.fetchPools(PUSD_TOKENID);
          const trade = Cauldron.prepareTrade(
            PUSD_TOKENID,
            "BCH",
            pusdBalance,
            activeWallet,
            false
          );
          await Cauldron.broadcastTransaction(trade.tx_hex);
        }
      } catch (_e) {
        Notification.error(
          translate(translations.modoEstableDeactivationFailed)
        );
      }
    } else {
      // ---------------- Activation ----------------
      const isConfirmed = await Modal.showConfirm({
        title: translate(translations.modoEstableActivationTitle),
        message: translate(translations.modoEstableActivationMessage),
      });
      if (!isConfirmed) return;

      handleSettingsUpdate("stablecoinMode", "true");
      Notification.success(
        translate(translations.modoEstableActivationSuccess)
      );

      // Best-effort BCH→PUSD activation swap
      try {
        const Cauldron = CauldronService();
        const spendable = BigInt(activeWallet.spendable_balance);
        const swapSats = (spendable * (100n - STABLE_RESERVE_PCT)) / 100n;

        if (swapSats > 5000n) {
          await Cauldron.fetchPools(PUSD_TOKENID);
          const trade = Cauldron.prepareTrade(
            "BCH",
            PUSD_TOKENID,
            swapSats,
            activeWallet,
            true
          );
          await Cauldron.broadcastTransaction(trade.tx_hex);
        }
      } catch (_e) {
        Notification.error(translate(translations.modoEstableActivationFailed));
      }
    }
  }, [
    activeWallet,
    isStablecoinMode,
    handleSettingsUpdate,
    Modal,
    Notification,
  ]);

  return (
    <Accordion.Child
      icon={undefined}
      label={translate(translations.modoEstable)}
      description={translate(translations.modoEstableDescription)}
    >
      <Checkbox checked={isStablecoinMode} onChange={handleToggle} />
    </Accordion.Child>
  );
}
