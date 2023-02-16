import { useState } from "react";
import { SATOSHI } from "@/util/constants";

function WalletViewBalance({ balance }) {
  // TODO: persist state/settings
  const [hideBalance, setHideBalance] = useState(false);
  const [bchFirst, setBchFirst] = useState(true);

  const formatSatoshis = (sats) => `${(sats / SATOSHI).toFixed(8)}`;

  const unit = "BCH"; // TODO: "Denomination" setting
  const localUnit = "USD"; // TODO: "Local Currency" setting

  const formattedBalance = hideBalance
    ? `₿ x.xxxxxxxx ${unit}`
    : `₿ ${formatSatoshis(balance)} ${unit}`;

  const formattedLocalBalance = hideBalance
    ? `${localUnit} $x.xx`
    : `${localUnit} $0.00`;

  return (
    <div className="mx-auto p-3 text-center bg-zinc-900">
      <div className="font-bold text-zinc-400 text-md tracking-wide">Available Balance</div>
      <div onClick={() => setHideBalance(!hideBalance)} className="text-2xl text-zinc-200">
        {bchFirst ? formattedBalance : formattedLocalBalance}
      </div>
      <div onClick={() => setBchFirst(!bchFirst)} className="text-md text-zinc-400">
        {bchFirst ? formattedLocalBalance : formattedBalance}
      </div>
    </div>
  );
}

export default WalletViewBalance;
