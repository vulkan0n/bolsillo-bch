import { useEffect } from "react";
import { SATOSHI } from "@/util/sats";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { EyeInvisibleOutlined } from "@ant-design/icons";

import { animated, useSpring } from "@react-spring/web";

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

  const [balanceReceivedSpring, receiveSpringApi] = useSpring(() => ({
    from: { color: "#8dc451" },
    to: { color: "#e4e4e7" },
    immediate: true, //strangely, it stops the immediate animation when true, not false.
    config: {
      tension: 280,
      friction: 60,
    },
  }));

  useEffect(
    function animateWalletBalanceOnReceive() {
      receiveSpringApi.start({ reset: true });
    },
    [balance]
  );

  return (
    <div className="py-3 text-center">
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
              hideBalance
                ? "blur-sm backdrop-invert backdrop-opacity-60 opacity-25"
                : ""
            }`}
          >
            <animated.span style={{ ...balanceReceivedSpring }}>
              {preferLocal ? formattedLocalBalance : formattedBalance}
            </animated.span>
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
