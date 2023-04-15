import { SATOSHI } from "@/util/sats";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";

import { EyeInvisibleOutlined } from "@ant-design/icons";

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
    ? `${localUnit} $X.XX`
    : `${localUnit} $0.00`;

  return (
    <div className="mx-auto p-3 text-center">
      {!hideBalance && (
        <div className="font-bold text-zinc-400 text-md tracking-wide">
          Available Balance
        </div>
      )}
      <div className="text-2xl text-zinc-200">
        <span onClick={handleHideBalance} className="cursor-pointer">
          {hideBalance && (
            <EyeInvisibleOutlined className="text-zinc-400 opacity-60 px-1" />
          )}
          &nbsp;
          <span
            className={`${
              hideBalance ? "blur-sm backdrop-invert backdrop-opacity-60 opacity-25" : ""
            }`}
          >
            {preferLocal ? formattedLocalBalance : formattedBalance}
          </span>
        </span>
      </div>
      {!hideBalance && (
        <div className="text-md text-zinc-400 cursor-pointer">
          <span onClick={handleFlipCurrency}>
            {preferLocal ? formattedBalance : formattedLocalBalance}
          </span>
        </div>
      )}
    </div>
  );
}

export default WalletViewBalance;
