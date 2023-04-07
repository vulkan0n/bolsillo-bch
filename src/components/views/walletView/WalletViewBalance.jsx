import { SATOSHI } from "@/util/sats";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";

function WalletViewBalance() {
  const { balance } = useSelector(selectActiveWallet);
  const preferences = useSelector(selectPreferences);

  const dispatch = useDispatch();

  const hideBalance = preferences["hideAvailableBalance"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";
  const denominateSats = preferences["denominateSats"] === "true";

  const unit = denominateSats ? "sats" : "BCH";
  const localUnit = preferences["localCurrency"];

  const formatSatoshis = (sats) =>
    denominateSats ? sats : `${(sats / SATOSHI).toFixed(8)}`;

  const handleHideBalance = () => {
    dispatch(
      setPreference({ key: "hideAvailableBalance", value: !hideBalance })
    );
  };

  const handleFlipCurrency = () => {
    dispatch(
      setPreference({ key: "preferLocalCurrency", value: !preferLocal })
    );
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
      <div className="text-2xl text-zinc-200">
        <span onClick={handleHideBalance}>{preferLocal ? formattedLocalBalance : formattedBalance}</span>
      </div>
      <div className="text-md text-zinc-400">
        <span onClick={handleFlipCurrency}>{preferLocal ? formattedBalance : formattedLocalBalance}</span>
      </div>
    </div>
  );
}

export default WalletViewBalance;
