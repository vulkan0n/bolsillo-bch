import Logger from "js-logger";
import { useRouteError, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BugOutlined } from "@ant-design/icons";
import SeleneLogo from "@/components/atoms/SeleneLogo";
import Accordion from "@/components/atoms/Accordion";
import ShowMnemonic from "@/components/atoms/ShowMnemonic";

import WalletManagerService from "@/services/WalletManagerService";

import { selectActiveWallet, walletBoot } from "@/redux/wallet";
import { syncReconnect } from "@/redux/sync";
import { resetPreferences, selectBchNetwork } from "@/redux/preferences";

export default function ErrorBoundary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useRouteError();
  Logger.debug(error);
  Logger.error(error);

  const wallet = useSelector(selectActiveWallet);
  const bchNetwork = useSelector(selectBchNetwork);

  const handleRestartApp = () => {
    window.location.assign("/");
  };

  const handleRebuildWallet = () => {
    WalletManagerService().clearWalletData(wallet.id);
    dispatch(walletBoot({ wallet_id: wallet.id, network: bchNetwork }));
    dispatch(syncReconnect());
    navigate("/");
  };

  const handleResetPreferences = () => {
    dispatch(resetPreferences());
  };

  //const handleSendDiagnosticInfo = () => null;

  return (
    <>
      <div className="text-2xl p-1 bg-zinc-900 text-zinc-300 font-bold flex items-center">
        <span>
          <SeleneLogo className="h-14 mr-2" />
        </span>
        <span className="flex-1">Something went wrong...</span>
      </div>
      <div className="p-2">
        <div className="bg-zinc-200 p-2 rounded my-1">
          <div className="text-xl font-bold mb-2">
            Here&apos;s what you can try:
          </div>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleRestartApp}
            >
              Restart App
            </button>
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleResetPreferences}
            >
              Reset Settings
            </button>
            <button
              type="button"
              className="bg-primary rounded text-white p-1 flex-1"
              onClick={handleRebuildWallet}
            >
              Rebuild Wallet
            </button>
            {/*
            <button
              type="button"
              className="bg-primary rounded text-white p-1"
              onClick={handleSendDiagnosticInfo}
            >
              Send Diagnostic Info to Developers
            </button>
            */}
          </div>
        </div>
        <Accordion icon={BugOutlined} title="Error Message">
          <Accordion.Child icon={null} label="">
            <div className="font-mono bg-zinc-100 p-2 text-left">
              {error.message}
            </div>
          </Accordion.Child>
        </Accordion>
        <ShowMnemonic wallet={wallet} />
      </div>
    </>
  );
}
