import { useState } from "react";
import { SATOSHI } from "@/util/sats";
import usePreferences from "@/hooks/usePreferences";

import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";

function WalletViewBalance() {
  const wallet = useSelector(selectActiveWallet);
  console.log("WalletViewBalance", wallet);
  const balance = wallet.balance;
  const { preferences, setPreference } = usePreferences();

  const hideBalance = preferences["hideAvailableBalance"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";
  const denominateSats = preferences["denominateSats"] === "true";

  const unit = denominateSats ? "sats" : "BCH";
  const localUnit = preferences["localCurrency"];

  const formatSatoshis = (sats) =>
    denominateSats ? sats : `${(sats / SATOSHI).toFixed(8)}`;

  const handleHideBalance = () => {
    setPreference("hideAvailableBalance", !hideBalance);
  };

  const handleFlipCurrency = () => {
    setPreference("preferLocalCurrency", !preferLocal);
  };

  const formattedBalance = hideBalance
    ? `₿ xxxxxxxxxx`
    : `₿ ${formatSatoshis(balance)} ${unit}`;

  const formattedLocalBalance = hideBalance
    ? `${localUnit} $x.xx`
    : `${localUnit} $0.00`;

  return (
    <div className="mx-auto p-3 text-center bg-zinc-900">
      <div className="font-bold text-zinc-400 text-md tracking-wide">
        Available Balance
      </div>
      <div onClick={handleHideBalance} className="text-2xl text-zinc-200">
        {preferLocal ? formattedLocalBalance : formattedBalance}
      </div>
      <div onClick={handleFlipCurrency} className="text-md text-zinc-400">
        {preferLocal ? formattedBalance : formattedLocalBalance}
      </div>
    </div>
  );
}

export default WalletViewBalance;
