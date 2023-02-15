import { useState, useEffect } from "react";
import { Link, Routes, Route, Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";

import WalletService from "../../services/WalletService";

function WalletView() {
  const [wallet, setWallet] = useState(null);

  useEffect(function loadWallet() {
    const W = new WalletService();

    let w = W.loadWallet("Selene Default");

    setWallet({ ...w, ...W });
  }, []);

  console.log(wallet);
  const addresses = [...Array(8).keys()].map((i) =>
    wallet !== null ? wallet.generateAddress(wallet.hd, i) : ""
  );
  console.log(addresses);

  return (
    <>
      <div>
        <WalletViewBalance satoshis={168438374} />
        <div>
          <Link to="send">Send</Link>
          <Link to="">Receive</Link>
        </div>
        <Outlet />
      </div>

      <Routes>
        <Route path="" element={<WalletViewReceive addresses={addresses} />} />
        <Route path="send" element={<WalletViewSend />} />
      </Routes>
    </>
  );
}

export default WalletView;
