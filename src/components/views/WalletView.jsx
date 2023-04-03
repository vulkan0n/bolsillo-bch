import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences } from "@/redux/preferences";
import { walletActivate, selectActiveWallet } from "@/redux/wallet";

function WalletView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);

  console.log("WalletView", wallet);

  useEffect(function activate() {
    dispatch(walletActivate(preferences["activeWalletId"]));
  }, []);

  return wallet.id !== 0 ? (
    <>
      <WalletViewBalance />
      <WalletViewTabs />
      <Outlet />
    </>
  ) : null;
}

export default WalletView;
