import { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";
import WalletViewSendConfirm from "./walletView/WalletViewSendConfirm";
import WalletService from "@/services/WalletService";

const electrum = new ElectrumClient(
  "Selene.cash",
  "1.4",
  "cashnode.bch.ninja",
  ElectrumTransport.WSS.Port,
  ElectrumTransport.WSS.Scheme
);

// TODO: what happens if connection fails?
await electrum.connect();

function WalletView() {
  const [balanceMap, setBalanceMap] = useState(new Map());
  const [balance, setBalance] = useState(0);

  // TODO: get addresses from db
  const generateDummyAddresses = () => {
    const activeWalletKey = "Selene Default";
    const wallet = new WalletService().loadWallet(activeWalletKey);
    return [...new Array(4).keys()].map((i) => wallet.generateAddress(i));
  };

  const subscribedAddresses = useMemo(() => generateDummyAddresses());

  async function handleBalanceUpdate(b) {
    if (!Array.isArray(b)) return;

    const address = b[0];
    const balance = await requestBalance(address);
    updateBalanceMap(address, balance);
  }

  async function requestBalance(address) {
    const b = await electrum.request("blockchain.address.get_balance", address);
    return b.confirmed + b.unconfirmed;
  }

  function updateBalanceMap(address, balance) {
    setBalanceMap((map) => new Map(map.set(address, balance)));
  }

  useEffect(function initHotWallet() {
    async function setup() {
      subscribedAddresses.forEach(async (address) => {
        await electrum.subscribe(
          handleBalanceUpdate,
          "blockchain.address.subscribe",
          address
        );

        const balance = await requestBalance(address);
        updateBalanceMap(address, balance);
      });
    }

    function destroy() {
      subscribedAddresses.forEach(
        async (address) =>
          await electrum.unsubscribe(
            handleBalanceUpdate,
            "blockchain.address.subscribe",
            address
          )
      );
    }

    setup();
    return () => destroy();
  }, []);

  useEffect(
    function resyncBalance() {
      const newBalance = [...balanceMap.values()].reduce(
        (sum, bal) => sum + bal,
        0
      );
      console.log("resyncBalance", newBalance);
      setBalance(newBalance);
    },
    [balanceMap]
  );

  return (
    <>
      <WalletViewBalance balance={balance} />
      <WalletViewTabs />
      <Outlet context={{balance}} />
    </>
  );
}

export default WalletView;
