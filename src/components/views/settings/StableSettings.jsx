import { useCallback, useContext, useState } from "react";
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
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!activeWallet) return;

    setIsToggling(true);

    if (isStablecoinMode) {
      // ---------------- Deactivation ----------------
      const isConfirmed = await Modal.showConfirm({
        title: translate(translations.modoEstableDeactivationTitle),
        message: translate(translations.modoEstableDeactivationMessage),
      });
      if (!isConfirmed) {
        setIsToggling(false);
        return;
      }

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
          // Use isDemandFlipped=true to call constructTradeBestRateForTargetSupply
          // so amount=pusdBalance is correctly treated as PUSD supply (not BCH demand).
          // Fee buffer provides BCH coins for miner fee + PUSD change output dust.
          const feeBuffer = BigInt(activeWallet.spendable_balance);
          const trade = Cauldron.prepareTrade(
            PUSD_TOKENID,
            "BCH",
            pusdBalance,
            activeWallet,
            true,
            feeBuffer
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
      if (!isConfirmed) {
        setIsToggling(false);
        return;
      }

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

    setIsToggling(false);
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
      <Checkbox
        checked={isStablecoinMode}
        onChange={handleToggle}
        disabled={isToggling}
      />
      {isToggling && (
        <span className="text-xs text-neutral-400 ml-1">
          Procesando swap...
        </span>
      )}
    </Accordion.Child>
  );
}
