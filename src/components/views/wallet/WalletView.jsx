import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectScannerIsScanning } from "@/redux/device";
import WalletViewBalance from "./WalletViewBalance";
import SyncIndicator from "./SyncIndicator";
import BalanceHideButton from "./BalanceHideButton";

export default function WalletView() {
  const isScanning = useSelector(selectScannerIsScanning);
  return (
    <>
      {!isScanning && (
        <div className="flex bg-zinc-900 justify-between">
          <div className="flex flex-col justify-center px-5">
            <BalanceHideButton className="text-xl text-primary" />
          </div>
          <WalletViewBalance />
          <div className="flex flex-col justify-center px-5">
            <SyncIndicator />
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}
