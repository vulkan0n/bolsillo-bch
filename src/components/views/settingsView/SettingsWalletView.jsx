import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { walletBoot } from "@/redux/wallet";
import { setPreference } from "@/redux/preferences";
import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

export default function SettingsWalletView() {
  const { wallet_id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const wallet = new WalletService().getWalletById(wallet_id);
  console.log("SettingsWalletView", wallet_id, wallet);

  const handleActivateWallet = () => {
    dispatch(walletBoot(wallet.id));
    dispatch(setPreference({ key: "activeWalletId", value: wallet.id }));
    navigate("/");
  };

  const handleDeleteWallet = () => null;

  return (
    <>
      <ViewHeader icon={WalletOutlined} title="Wallet Settings" />
      <div className="p-2">
        <ul className="p-3 rounded-lg bg-zinc-200">
          {Object.keys(wallet).map((key) => (
            <li key={key}>{`${key}: ${wallet[key]}`}</li>
          ))}
        </ul>
        <div className="my-2 flex gap-x-2">
          <div className="text-center">
            <button
              type="button"
              onClick={handleActivateWallet}
              className="btn btn-lg bg-primary text-zinc-50 w-full"
            >
              <LoginOutlined className="text-xl mr-1" />
              Use This Wallet
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleDeleteWallet}
              className="btn btn-lg bg-error text-zinc-50 w-full"
            >
              <DeleteOutlined className="text-lg mr-1" />
              Delete Wallet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
