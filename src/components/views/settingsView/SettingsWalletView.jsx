import { useState, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPreference, selectActiveWalletId, selectPreferences } from "@/redux/preferences";
import { walletBoot, walletReload } from "@/redux/wallet";
import { syncReconnect } from "@/redux/sync";
import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningFilled,
  EyeInvisibleOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";
import KeyWarning from "./KeyWarning";

import SettingsCategory from "./SettingsCategory";
import SettingsChild from "./SettingsChild";
import { formatSatoshis } from "@/util/sats";

export default function SettingsWalletView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallet_id } = useParams();
  const activeWalletId = useSelector(selectActiveWalletId);
  const isActiveWallet = wallet_id === activeWalletId;

  const preferences = useSelector(selectPreferences);
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const WalletManager = new WalletService();
  const wallet = WalletManager.getWalletById(wallet_id);

  // if invalid wallet_id passed via queryparams, redirect back to settings
  if (wallet === null) {
    return <Navigate to="/settings" />;
  }

  // toggle visibility for recovery phrase
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);

  // toggle editing state for "wallet name"
  const [isEditingWalletName, setIsEditingWalletName] = useState(false);
  const [walletEditedName, setWalletEditedName] = useState(wallet.name);

  // user must tap "delete wallet" button multiple times to confirm
  const [deleteConfirm, setDeleteConfirm] = useState(0);
  const deleteRef = useRef(null);
  const deleteDisabled = deleteConfirm === 2 && wallet.key_viewed === null;

  // handler for "Delete Wallet" button
  const handleDeleteWallet = () => {
    setDeleteConfirm((deleteConfirm + 1) % 4);

    // on 4th press, delete wallet and "reboot" app
    if (deleteConfirm === 3) {
      WalletManager.deleteWallet(wallet_id);
      dispatch(walletBoot(1));
      navigate("/");
    } else {
      // if user hesitates, reset the counter
      clearTimeout(deleteRef.current);
      deleteRef.current = setTimeout(() => {
        setDeleteConfirm(0);
      }, 3250 + deleteConfirm * 600); // give them time to read the prompts though
    }
  };

  // handler for "Activate Wallet" button
  const handleActivateWallet = () => {
    dispatch(walletBoot(wallet.id));
    dispatch(syncReconnect());
    navigate("/");
  };

  // handler for mnemonic visibility area
  const handleShowMnemonic = () => {
    if (showRecoveryPhrase === false) {
      setShowRecoveryPhrase(true);
      WalletManager.updateKeyViewed(wallet_id);
      dispatch(walletReload());
    } else {
      setShowRecoveryPhrase(false);
    }
  };

  // handler for wallet name edit button
  const handleEdit = () => {
    if (isEditingWalletName === true) {
      WalletManager.setWalletName(wallet_id, walletEditedName);
      dispatch(walletReload());
      setIsEditingWalletName(false);
    } else {
      setIsEditingWalletName(true);
    }
  };

  // handler for wallet name edit textbox
  const handleWalletNameTextChange = (event) => {
    setWalletEditedName(event.target.value);
  };

  // handler for "rebuild wallet" button
  const handleRebuildWallet = () => {
    WalletManager.clearWalletData(wallet.id);
    handleActivateWallet();
  };

  return (
    <>
      <ViewHeader icon={WalletOutlined} title="Wallet Settings" />
      <div className="p-2">
        <div className="p-3 rounded-lg bg-zinc-200">
          <div className="text-2xl">
            {isEditingWalletName ? (
              <div className="flex items-center">
                <input
                  type="text"
                  className="rounded-lg bg-white text-primary p-1 mx-1 w-full text-center"
                  onChange={handleWalletNameTextChange}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  value={walletEditedName}
                />
                <EditOutlined className="text-2xl ml-2" onClick={handleEdit} />
              </div>
            ) : (
              <div className="grid grid-cols-6">
                <div className="col-span-1">&nbsp;</div>
                <div className="text-center col-span-4">{wallet.name}</div>
                <div className="col-span-1 flex items-center justify-center opacity-90">
                  <EditOutlined className="text-2xl" onClick={handleEdit} />
                </div>
              </div>
            )}
          </div>
          <div className="text-lg text-center text-zinc-600">
            Created {wallet.date_created}
          </div>
          {wallet.balance > 0 && (
            <div className="text-lg text-center text-zinc-500">
              Last Known Balance: {formatSatoshis(wallet.balance)[preferLocal ? "fiat" : "bch"]}
            </div>
          )}
        </div>

        <div className="my-2 flex gap-x-2">
          <div className="text-center flex-1">
            <button
              type="button"
              onClick={handleActivateWallet}
              className={`rounded-lg p-4 bg-primary text-zinc-50 w-full ${
                isActiveWallet ? "saturate-[.80]" : ""
              }`}
              disabled={isActiveWallet}
            >
              <div className="flex items-center">
                {wallet_id === activeWalletId ? (
                  <CheckCircleOutlined className="text-white text-2xl" />
                ) : (
                  <LoginOutlined className="text-2xl mr-1" />
                )}
                <div className="flex-1">
                  {isActiveWallet ? "Wallet Active" : "Activate Wallet"}
                </div>
              </div>
            </button>
          </div>
          <div className="text-center flex-1">
            <button
              type="button"
              onClick={handleDeleteWallet}
              className={`rounded-lg p-4 bg-error text-zinc-50 w-full ${
                deleteDisabled ? "saturate-[.60]" : ""
              }`}
              disabled={deleteDisabled}
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
                    ? "MAKE SURE YOU HAVE WRITTEN YOUR RECOVERY PHRASE"
                    : `Yes, I want to delete "${wallet.name}"`}
                </div>
              </div>
            </button>
          </div>
        </div>
        <KeyWarning wallet={wallet} />
        <div
          className="bg-zinc-700 flex-col rounded-lg flex items-center justify-center my-4 px-2 py-4 cursor-pointer"
          onClick={handleShowMnemonic}
        >
          {showRecoveryPhrase ? (
            <div className="flex flex-col justify-between items-center">
              <div className="text-center text-error text-xl font-bold">
                <WarningFilled className="mr-2 text-warning" />
                KEEP THIS PHRASE SECRET
                <WarningFilled className="ml-2 text-warning" />
              </div>
              <div className="text-center text-zinc-50 text-xl font-mono py-4">
                {wallet.mnemonic}
              </div>
              <div className="text-center text-error text-xl font-bold">
                <WarningFilled className="mr-2 text-warning" />
                DO NOT STORE DIGITALLY
                <WarningFilled className="ml-2 text-warning" />
              </div>
            </div>
          ) : (
            <>
              <EyeInvisibleOutlined className="text-8xl text-zinc-50" />
              <div className="text-center text-zinc-50 text-xl">
                View Wallet Recovery Phrase
              </div>
              <div className="text-center text-zinc-200 text-lg opacity-90">
                (Make sure to keep it secret and secure!)
              </div>
            </>
          )}
        </div>
        {
          /* Only show "Advanced Options" if user has viewed (TODO: verified) their recovery phrase */
          wallet.key_viewed !== null && isActiveWallet && (
            <SettingsCategory icon={ToolOutlined} title="Advanced Options">
              <button
                type="button"
                className="w-full block p-2 text-left"
                onClick={handleRebuildWallet}
              >
                <MedicineBoxOutlined className="text-xl mr-1" />
                Rebuild Wallet
              </button>
              {/*<button
              type="button"
              className="w-full block p-2 text-left"
              onClick={null}
            >
              <KeyOutlined className="text-xl mr-1" />
              View xPub/xPriv
            </button>*/}
            </SettingsCategory>
          )
        }
      </div>
    </>
  );
}
