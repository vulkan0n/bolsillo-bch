import { Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";

function WalletView() {
  return (
    <>
      <WalletViewBalance />
      <WalletViewTabs />
      <Outlet />
    </>
  );
}

export default WalletView;
