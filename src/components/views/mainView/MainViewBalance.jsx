import { useState } from "react";

// TODO: persist state/settings
function MainViewBalance() {
  const [hideBalance, setHideBalance] = useState(false);
  const [bchFirst, setBchFirst] = useState(true);

  const unit = "BCH"; // TODO: "Denomination" setting 
  const localUnit = "USD"; // TODO: "Local Currency" setting
  const formattedBalance = hideBalance ? `X.XXXXXXXX ${unit}` : `0.00000000 ${unit}`;
  const formattedLocalBalance = hideBalance ? `${localUnit} $X.XX` : `${localUnit} $0.00`;

  return (
      <div>
        <div>Available Balance</div>
        <div onClick={() => setHideBalance(!hideBalance)}>{ bchFirst ? formattedBalance : formattedLocalBalance}</div>
        <div onClick={() => setBchFirst(!bchFirst)}>{bchFirst ? formattedLocalBalance : formattedBalance}</div>
      </div>
  );
}

export default MainViewBalance;
