import { useState, useEffect } from "react";
import { Link, Routes, Route, Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";

import useWallet from "@/hooks/useWallet";

function WalletView() {
  // TODO: fetch active wallet from user preferences/DB
  const activeWalletKey = "Selene Default";
  const wallet = useWallet(activeWalletKey);

  const freshAddresses = wallet.getFreshAddresses();
  const satoshiBalance = wallet.getSatoshiBalance();

  console.log("WalletView addresses", freshAddresses);

  return (
    <>
      <div>
        <WalletViewBalance satoshis={satoshiBalance} />
        <div>
          <Link to="send">Send</Link>
          <Link to="">Receive</Link>
        </div>
        <Outlet />
      </div>

      <Routes>
        <Route path="" element={<WalletViewReceive addresses={freshAddresses} />} />
        <Route path="send" element={<WalletViewSend />} />
      </Routes>
    </>
  );
}

export default WalletView;
