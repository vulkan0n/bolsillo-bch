import { Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import SyncIndicator from "./walletView/SyncIndicator";
import BalanceHideButton from "./walletView/BalanceHideButton";

export default function WalletView() {
  return (
    <>
      <div className="flex bg-zinc-900 justify-between">
        <div className="flex flex-col justify-center px-5">
          <BalanceHideButton className="text-xl text-primary" />
        </div>
        <WalletViewBalance />
        <div className="flex flex-col justify-center px-5">
          <SyncIndicator />
        </div>
      </div>
      <Outlet />
    </>
  );
}
