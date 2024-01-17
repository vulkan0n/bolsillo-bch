import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningFilled,
  ToolOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { selectActiveWalletId, selectBchNetwork } from "@/redux/preferences";
import { walletBoot, walletSetName } from "@/redux/wallet";
import { selectLocale } from "@/redux/device";
import { syncReconnect } from "@/redux/sync";

import ViewHeader from "@/layout/ViewHeader";

import WalletManagerService from "@/services/WalletManagerService";

import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import ShowMnemonic from "@/atoms/ShowMnemonic";
import Accordion from "@/atoms/Accordion";
import Satoshi from "@/atoms/Satoshi";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SettingsWalletView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallet_id } = useParams();
  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWalletById(wallet_id);

  const activeWalletId = useSelector(selectActiveWalletId);
  const isActiveWallet = wallet.id === activeWalletId;

  const bchNetwork = useSelector(selectBchNetwork);

  const locale = useSelector(selectLocale);

  const shouldShowAdvancedOptions =
    wallet.key_viewed !== null && isActiveWallet;

  // toggle editing state for "wallet name"
  const [isEditingWalletName, setIsEditingWalletName] = useState(false);
  const [walletEditedName, setWalletEditedName] = useState(wallet.name);

  // user must tap "delete wallet" button multiple times to confirm
  const [deleteConfirm, setDeleteConfirm] = useState(0);
  const deleteRef = useRef(null);
  const isDeleteDisabled = deleteConfirm === 2 && wallet.key_viewed === null;

  // handler for "Delete Wallet" button
  const handleDeleteWallet = () => {
    setDeleteConfirm((deleteConfirm + 1) % 4);

    // on 4th press, delete wallet and "reboot" app
    if (deleteConfirm === 3) {
      WalletManager.deleteWallet(wallet.id);
      dispatch(walletBoot({ wallet_id: 1, network: bchNetwork }));
      navigate("/");
    } else {
      // if user hesitates, reset the counter
      clearTimeout(deleteRef.current);
      deleteRef.current = setTimeout(
        () => {
          setDeleteConfirm(0);
        },
        3250 + deleteConfirm * 600
      ); // give them time to read the prompts though
    }
  };

  // handler for "Activate Wallet" button
  const handleActivateWallet = () => {
    dispatch(walletBoot({ wallet_id: wallet.id, network: bchNetwork }));
    dispatch(syncReconnect());
    navigate("/");
  };

  // handler for wallet name edit button
  const handleEdit = () => {
    if (isEditingWalletName === true) {
      dispatch(walletSetName({ wallet_id: wallet.id, name: walletEditedName }));
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

  const handleNavigateAdditionalWalletInformation = () => {
    navigate(`/settings/wallet/${wallet.id}/additionalInformation`);
  };

  return (
    <>
      <ViewHeader
        icon={WalletOutlined}
        title={translate(translations.walletSettings)}
      />
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
            {translate(translations.created)}{" "}
            {new Date(wallet.date_created).toLocaleString(locale)}
          </div>
          {wallet.balance > 0 && (
            <div className="text-lg text-center text-zinc-500">
              {translate(translations.lastKnownBalance)}:{" "}
              <Satoshi value={wallet.balance} />
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
                {wallet.id === activeWalletId ? (
                  <CheckCircleOutlined className="text-white text-2xl" />
                ) : (
                  <LoginOutlined className="text-2xl mr-1" />
                )}
                <div className="flex-1">
                  {isActiveWallet
                    ? translate(translations.walletActive)
                    : translate(translations.activateWallet)}
                </div>
              </div>
            </button>
          </div>
          <div className="text-center flex-1">
            <button
              type="button"
              onClick={handleDeleteWallet}
              className={`rounded-lg p-4 bg-error text-zinc-50 w-full ${
                isDeleteDisabled ? "saturate-[.60]" : ""
              }`}
              disabled={isDeleteDisabled}
            >
              <div className="flex items-center">
                {deleteConfirm > 0 ? (
                  <WarningFilled className="text-2xl mr-1 text-yellow-300" />
                ) : (
                  <DeleteOutlined className="text-2xl mr-1" />
                )}
                <div className="flex-1">
                  {
                    /* eslint-disable no-nested-ternary */
                    deleteConfirm === 0
                      ? translate(translations.deleteWallet)
                      : deleteConfirm === 1
                        ? translate(translations.areYouSure)
                        : deleteConfirm === 2
                          ? translate(translations.ensureRecoveryPhrase)
                          : `${translate(translations.confirmDelete)} "${
                              wallet.name
                            }"`
                    /* eslint-enable no-nested-ternary */
                  }
                </div>
              </div>
            </button>
          </div>
        </div>

        <KeyWarning wallet={wallet} />
        <ShowMnemonic wallet={wallet} />
        {
          /* Only show "Advanced Options" if user has viewed (TODO: verified) their recovery phrase */
          shouldShowAdvancedOptions && (
            <Accordion
              icon={ToolOutlined}
              title={translate(translations.advancedOptions)}
            >
              <Accordion.Child icon={null} label="">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={handleNavigateAdditionalWalletInformation}
                >
                  <InfoCircleOutlined className="text-xl mr-1" />
                  {translate(translations.additionalWalletInformation)}
                </button>
              </Accordion.Child>
              <Accordion.Child icon={null} label="">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={handleRebuildWallet}
                >
                  <MedicineBoxOutlined className="text-xl mr-1" />
                  {translate(translations.rebuildWallet)}
                </button>
              </Accordion.Child>
            </Accordion>
          )
        }
      </div>
    </>
  );
}
