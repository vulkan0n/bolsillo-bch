import { useState, useEffect } from "react";
import { Link, Routes, Route, Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";

import WalletService from "@/services/WalletService";

function WalletView() {
  const wallet = new WalletService().loadWallet("Selene Default");

  // grab a few addresses after the wallet loads
  // TODO: get these addresses from DB instead
  const addresses = [...Array(8).keys()].map((i) =>
    wallet !== null ? wallet.generateAddress(i) : ""
  );

  // TODO: subscribe to addresses with electrum
  console.log(addresses);

  // TODO: get wallet satoshi balance

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
