import { Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";
import SyncIndicator from "./walletView/SyncIndicator";

export default function WalletView() {
  return (
    <>
      <div className="grid grid-cols-6 bg-zinc-900 select-none">
        <div className="col-span-1">&nbsp;</div>
        <div className="col-span-4">
          <WalletViewBalance />
        </div>
        <div className="col-span-1 flex justify-center items-center">
          <SyncIndicator />
        </div>
      </div>
      <Outlet />
    </>
  );
}
