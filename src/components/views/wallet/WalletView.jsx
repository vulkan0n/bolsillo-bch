import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { SyncOutlined } from "@ant-design/icons";
import { selectActiveWalletHash, selectGenesisHeight } from "@/redux/wallet";
import { selectScannerIsScanning } from "@/redux/device";
import { selectIsConnected } from "@/redux/sync";
import ElectrumService from "@/services/ElectrumService";
import WalletViewBalance from "./WalletViewBalance";
import SyncIndicator from "./SyncIndicator";
import BalanceHideButton from "./BalanceHideButton";
import FullColumn from "@/layout/FullColumn";

export default function WalletView() {
  const walletHash = useSelector(selectActiveWalletHash);
  const genesis_height = useSelector(selectGenesisHeight);
  const isScanning = useSelector(selectScannerIsScanning);
  const isConnected = useSelector(selectIsConnected);
  const navigate = useNavigate();

  useEffect(
    function initialWalletBuild() {
      if (
        genesis_height === null &&
        (isConnected || ElectrumService().getIsConnected())
      ) {
        requestAnimationFrame(() =>
          navigate(`/settings/wallet/wizard/import/build/${walletHash}`)
        );
      }
    },
    [isConnected, genesis_height, walletHash, navigate]
  );

  return walletHash === "" ? (
    <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
      <SyncOutlined className="text-4xl" />
    </div>
  ) : (
    <FullColumn>
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
    </FullColumn>
  );
}
