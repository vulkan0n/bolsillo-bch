import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";

import {
  WalletOutlined,
  LoginOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  EditOutlined,
  WarningFilled,
  ToolOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  ExportOutlined,
} from "@ant-design/icons";

import {
  selectActiveWalletHash,
  selectBchNetwork,
  selectIsExperimental,
} from "@/redux/preferences";
import { walletBoot, walletSetName } from "@/redux/wallet";
import { selectLocale } from "@/redux/device";

import ViewHeader from "@/layout/ViewHeader";

import WalletManagerService from "@/services/WalletManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import ShowMnemonic from "@/atoms/ShowMnemonic";
import Accordion from "@/atoms/Accordion";
import Satoshi from "@/atoms/Satoshi";

import WalletSettings from "@/views/settings/WalletSettings";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SettingsWalletView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bchNetwork = useSelector(selectBchNetwork);

  const { walletHash } = useParams();

  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWalletMeta(walletHash);

  const activeWalletHash = useSelector(selectActiveWalletHash);
  const isActiveWallet = wallet.walletHash === activeWalletHash;

  const locale = useSelector(selectLocale);

  const shouldShowAdvancedOptions =
    wallet.key_viewed_at !== null && isActiveWallet;

  const isExperimental = useSelector(selectIsExperimental);

  // toggle editing state for "wallet name"
  const [isEditingWalletName, setIsEditingWalletName] = useState(false);
  const [isWalletNameSaved, setIsWalletNameSaved] = useState(false);
  const [walletEditedName, setWalletEditedName] = useState(wallet.name);

  // user must tap "delete wallet" button multiple times to confirm
  const [deleteConfirm, setDeleteConfirm] = useState(0);
  const deleteRef = useRef(setTimeout(() => {}, 0));
  const isDeleteDisabled = deleteConfirm === 2 && wallet.key_viewed_at === null;

  // handler for "Delete Wallet" button
  const handleDeleteWallet = async () => {
    setDeleteConfirm((deleteConfirm + 1) % 4);

    // on 4th press, delete wallet and "reboot" app
    if (deleteConfirm === 3) {
      const isAuthorized = await SecurityService().authorize();
      if (!isAuthorized) {
        return;
      }

      WalletManager.deleteWallet(wallet.walletHash);
      dispatch(walletBoot({ walletHash: "", network: bchNetwork }));
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
  const handleActivateWallet = async () => {
    const isAuthorized = await SecurityService().authorize(
      AuthActions.ActivateWallet
    );

    if (!isAuthorized) {
      return;
    }

    dispatch(
      walletBoot({ walletHash: wallet.walletHash, network: bchNetwork })
    );
    navigate("/");
  };

  // handler for wallet name edit button
  const handleEdit = () => {
    if (isEditingWalletName === true) {
      dispatch(
        walletSetName({ walletHash: wallet.walletHash, name: walletEditedName })
      );
      setIsEditingWalletName(false);
      setIsWalletNameSaved(true);
    } else {
      setIsEditingWalletName(true);
    }
  };

  // handler for wallet name edit textbox
  const handleWalletNameTextChange = (event) => {
    setWalletEditedName(event.target.value);
    setIsWalletNameSaved(false);
  };

  // handler for "rebuild wallet" button
  const handleRebuildWallet = () => {
    navigate(`/settings/wallet/wizard/import/build/${wallet.walletHash}`);
  };

  const handleExportWallet = async () => {
    const { uri } = await Filesystem.getUri({
      path: `/selene/wallets/${wallet.walletHash}.wallet.json`,
      directory: Directory.Library,
    });

    await Share.share({
      dialogTitle: `Export Wallet (${wallet.name})`,
      url: uri,
    });
  };

  /*
   const handleImportWallet = () => {
    // spawn file picker
  };
  */

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
              </div>
            ) : (
              <div
                className="flex justify-center items-center"
                onClick={handleEdit}
              >
                <span className="text-center mx-2">{wallet.name}</span>
                <span className="flex items-center justify-center opacity-90">
                  {isWalletNameSaved ? (
                    <CheckCircleFilled className="text-base text-primary" />
                  ) : (
                    <EditOutlined className="text-2xl" onClick={handleEdit} />
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="text-lg text-center text-zinc-600">
            {translate(translations.created)}{" "}
            {new Date(wallet.created_at).toLocaleString(locale)}
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
                {wallet.walletHash === activeWalletHash ? (
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

        <WalletSettings />
        <KeyWarning walletHash={wallet.walletHash} />
        <ShowMnemonic walletHash={wallet.walletHash} />
        {
          /* Only show "Advanced Options" if user has viewed (TODO: verified) their recovery phrase */
          shouldShowAdvancedOptions && (
            <Accordion
              icon={ToolOutlined}
              title={translate(translations.advancedOptions)}
            >
              <Accordion.Child icon={null} label="">
                <Link
                  className="w-full text-left flex items-center"
                  to={`/settings/wallet/${wallet.walletHash}/additionalInformation`}
                >
                  <InfoCircleOutlined className="text-xl mr-1" />
                  {translate(translations.additionalWalletInformation)}
                </Link>
              </Accordion.Child>
              {isExperimental && (
                <Accordion.Child icon={null} label="">
                  <Link
                    className="w-full text-left flex items-center"
                    to="scan"
                  >
                    <SyncOutlined className="text-xl mr-1" />
                    {translate(translations.addressScanTool)}
                  </Link>
                </Accordion.Child>
              )}
              <Accordion.Child icon={null} label="">
                <button
                  type="button"
                  className="w-full text-left flex items-center"
                  onClick={handleRebuildWallet}
                >
                  <MedicineBoxOutlined className="text-xl mr-1" />
                  {translate(translations.rebuildWallet)}
                </button>
              </Accordion.Child>
              {/*isExperimental && (
                <Accordion.Child icon={null} label="">
                  <button
                    type="button"
                    className="w-full text-left flex items-center"
                    onClick={handleImportWallet}
                  >
                    <ImportOutlined className="text-xl mr-1" />
                    {translate(translations.importWallet)}
                  </button>
                </Accordion.Child>
              )*/}
              {isExperimental && (
                <Accordion.Child icon={null} label="">
                  <button
                    type="button"
                    className="w-full text-left flex items-center"
                    onClick={handleExportWallet}
                  >
                    <ExportOutlined className="text-xl mr-1" />
                    {translate(translations.exportWallet)}
                  </button>
                </Accordion.Child>
              )}
            </Accordion>
          )
        }
      </div>
    </>
  );
}
