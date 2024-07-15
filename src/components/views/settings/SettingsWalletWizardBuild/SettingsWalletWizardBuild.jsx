import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SyncOutlined } from "@ant-design/icons";
import { selectBchNetwork } from "@/redux/preferences";
import { walletBoot } from "@/redux/wallet";
import { syncReconnect } from "@/redux/sync";
import WalletManagerService from "@/services/WalletManagerService";
import AddressScannerService from "@/services/AddressScannerService";

export default function SettingsWalletWizardBuild() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallet_id } = useParams();
  const bchNetwork = useSelector(selectBchNetwork);

  const [isBuilding, setIsBuilding] = useState(false);
  const [isBuildDone, setIsBuildDone] = useState(false);

  useEffect(
    function startBuild() {
      const scan = async () => {
        const wallet =
          WalletManagerService(bchNetwork).getWalletById(wallet_id);

        if (isBuildDone) {
          dispatch(walletBoot({ wallet_id: wallet.id, network: bchNetwork }));
          dispatch(syncReconnect());
          navigate("/");
          return;
        }

        if (isBuilding) {
          await AddressScannerService(wallet).rebuildWallet();
          setIsBuildDone(true);
        }

        if (!isBuilding) {
          setIsBuilding(true);
        }
      };

      scan();
    },
    [isBuilding, bchNetwork, wallet_id, dispatch, isBuildDone, navigate]
  );

  return (
    <div>
      <h2 className="text-2xl text-center">Importing Wallet</h2>
      <h3 className="text-xl text-center">
        This may take a few minutes for wallets with a large history!
      </h3>
      <div className="flex justify-center items-center">
        <SyncOutlined className="text-5xl" spin />
      </div>
    </div>
  );
}
