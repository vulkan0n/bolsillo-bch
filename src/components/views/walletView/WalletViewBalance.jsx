import { useState } from "react";
import { SATOSHI } from "@/util/constants";

// TODO: persist state/settings
function WalletViewBalance({satoshis}) {
  const [hideBalance, setHideBalance] = useState(false);
  const [bchFirst, setBchFirst] = useState(true);

  const formatSatoshis = (sats) => `${sats / SATOSHI}`.padEnd(10, "0");


  const unit = "BCH"; // TODO: "Denomination" setting 
  const localUnit = "USD"; // TODO: "Local Currency" setting
  const formattedBalance = hideBalance ? `X.XXXXXXXX ${unit}` : `${formatSatoshis(satoshis)} ${unit}`;
  const formattedLocalBalance = hideBalance ? `${localUnit} $X.XX` : `${localUnit} $0.00`;

  return (
      <div>
        <div>Available Balance</div>
        <div onClick={() => setHideBalance(!hideBalance)}>{ bchFirst ? formattedBalance : formattedLocalBalance}</div>
        <div onClick={() => setBchFirst(!bchFirst)}>{bchFirst ? formattedLocalBalance : formattedBalance}</div>
      </div>
  );
}

export default WalletViewBalance;
