import { Link, Routes, Route, Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewReceive from "./walletView/WalletViewReceive";
import WalletViewSend from "./walletView/WalletViewSend";

import useWallet from "../../hooks/useWallet";

function WalletView() {
  const wallet = useWallet();

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
        <Route path="" element={<WalletViewReceive />} />
        <Route path="send" element={<WalletViewSend />} />
      </Routes>
    </>
  );
}

export default WalletView;
