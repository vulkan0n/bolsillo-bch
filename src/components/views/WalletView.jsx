import { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";

import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";
import WalletViewSendConfirm from "./walletView/WalletViewSendConfirm";
import WalletService from "@/services/WalletService";

function WalletView() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(function initHotWallet() {
    async function setup() {
      const w = await new WalletService().boot(1);
      setWallet(w);
      console.log("initHotWallet", w);
    }

    setup();
  }, []);

  return wallet !== null ? (
    <>
      <WalletViewBalance balance={balance} />
      <WalletViewTabs />
      <Outlet context={{ wallet, balance }} />
    </>
  ) : null;
}

export default WalletView;
