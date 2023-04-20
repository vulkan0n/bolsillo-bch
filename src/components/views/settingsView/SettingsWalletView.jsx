import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPreference, selectActiveWalletId } from "@/redux/preferences";
import { walletBoot } from "@/redux/wallet";
import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningFilled,
} from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

export default function SettingsWalletView() {
  const { wallet_id } = useParams();
  const navigate = useNavigate();

  const [deleteConfirm, setDeleteConfirm] = useState(0);
  const deleteRef = useRef(null);

  const dispatch = useDispatch();

  const activeWalletId = useSelector(selectActiveWalletId);

  const WalletManager = new WalletService();
  const wallet = WalletManager.getWalletById(wallet_id);

  if (wallet === null) {
    return null;
  }

  const handleActivateWallet = () => {
    dispatch(walletBoot(wallet.id));
    navigate("/");
  };

  // TODO: "are you sure?" modal
  const handleDeleteWallet = () => {
    setDeleteConfirm((deleteConfirm + 1) % 4);

    if (deleteConfirm === 3) {
      WalletManager.deleteWallet(wallet_id);
      dispatch(walletBoot(1));
      navigate("/");
    } else {
      clearTimeout(deleteRef.current);
      deleteRef.current = setTimeout(() => {
        setDeleteConfirm(0);
      }, 3000);
    }
  };

  return (
    <>
      <ViewHeader icon={WalletOutlined} title="Wallet Settings" />
      <div className="p-2">
        <div className="p-3 rounded-lg bg-zinc-200">
          <div className="text-2xl text-center">
            {wallet.name}
            <EditOutlined className="text-2xl ml-2" />
          </div>
          <div className="text-lg text-center text-zinc-600">
            Created {wallet.date_created}
          </div>
        </div>
        <div className="my-2 flex gap-x-2">
          <div className="text-center flex-1">
            <button
              type="button"
              onClick={handleActivateWallet}
              className="rounded-lg p-4 bg-primary text-zinc-50 w-full"
              disabled={wallet_id === activeWalletId}
            >
              <div className="flex items-center">
                {wallet_id === activeWalletId ? (
                  <CheckCircleOutlined className="text-white text-2xl" />
                ) : (
                  <LoginOutlined className="text-2xl mr-1" />
                )}
                <div className="flex-1">
                  {wallet_id === activeWalletId
                    ? "Wallet Active"
                    : "Activate Wallet"}
                </div>
              </div>
            </button>
          </div>
          <div className="text-center flex-1">
            <button
              type="button"
              onClick={handleDeleteWallet}
              className="rounded-lg p-4 bg-error text-zinc-50 w-full"
            >
              <div className="flex items-center">
                {deleteConfirm > 0 ? (
                  <WarningFilled className="text-2xl mr-1 text-yellow-300" />
                ) : (
                  <DeleteOutlined className="text-2xl mr-1" />
                )}
                <div className="flex-1">
                  {deleteConfirm === 0
                    ? "Delete Wallet"
                    : deleteConfirm === 1
                    ? "ARE YOU SURE? YOUR MONEY IS AT RISK"
                    : deleteConfirm === 2
                    ? "YOUR MONEY CAN NOT BE RECOVERED WITHOUT YOUR SEED PHRASE"
                    : `Yes, I want to delete "${wallet.name}"`}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
