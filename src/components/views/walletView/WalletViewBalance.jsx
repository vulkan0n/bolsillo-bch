import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { EyeInvisibleOutlined } from "@ant-design/icons";

import { animated, useSpring } from "@react-spring/web";
import { formatSatoshis } from "@/util/sats";

export default function WalletViewBalance() {
  const [firstRender, setFirstRender] = useState(true);
  const { balance } = useSelector(selectActiveWallet);
  const preferences = useSelector(selectPreferences);

  const hideBalance = preferences["hideAvailableBalance"] === "true";
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const dispatch = useDispatch();

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

  const [balanceReceivedSpring, receiveSpringApi] = useSpring(() => ({
    from: { color: "#8dc451" },
    to: { color: "#e4e4e7" },
    immediate: true, //strangely, it stops the immediate animation when true, not false.
    config: {
      tension: 270,
      friction: 112,
    },
  }));

  useEffect(
    function animateWalletBalanceOnReceive() {
      if (!firstRender) {
        receiveSpringApi.start({ reset: true });
      }

      setFirstRender(false);
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
      <div className="text-2xl text-zinc-200 tabular-nums">
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
              {formatSatoshis(balance)[preferLocal ? "fiat" : "bch"]}
            </animated.span>
          </span>
        </span>
      </div>
      {!hideBalance && (
        <div className="text-md text-zinc-400 cursor-pointer">
          <span onClick={handleFlipCurrency}>
            {formatSatoshis(balance)[preferLocal ? "bch" : "fiat"]}
          </span>
        </div>
      )}
    </div>
  );
}
