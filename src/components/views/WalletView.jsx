import { useState, useEffect, useMemo } from "react";
import { Link, Routes, Route, Outlet } from "react-router-dom";
import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import WalletViewBalance from "./walletView/WalletViewBalance";
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

await electrum.connect();

function WalletView() {
  // TODO: fetch active wallet from user preferences/DB
  const activeWalletKey = "Selene Default";
  const wallet = new WalletService().loadWallet(activeWalletKey);

  const [balanceMap, setBalanceMap] = useState(new Map());
  const [balance, setBalance] = useState(0);

  const subscribedAddresses = useMemo(() => getSubscribedAddresses());

  function getSubscribedAddresses() {
    // TODO: fetch subscribed addresses from db
    return [...new Array(4).keys()].map((i) => wallet.generateAddress(i));
  }

  function getNextReceiveAddress(skip) {
    return wallet.generateAddress(0 + skip);
  }

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
    <div>
      <WalletViewBalance balance={balance} />
      <div>
        <Link to="send">Send</Link>
        <Link to="">Receive</Link>
      </div>
      <Outlet />
    </div>
  );
}

export default WalletView;
