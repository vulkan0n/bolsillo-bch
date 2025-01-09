import { useState } from "react";
import { useSelector } from "react-redux";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import Satoshi from "@/atoms/Satoshi";
import UtxoManagerService from "@/services/UtxoManagerService";

export default function AssetsViewCoins() {
  const wallet = useSelector(selectActiveWallet);
  const UtxoManager = UtxoManagerService(wallet);
  const coins = UtxoManager.getWalletUtxos();
  return (
    <div className="p-1">
      <div>
        {coins.map((coin) => (
          <Coin key={`${coin.txid}:${coin.tx_pos}`} coin={coin} />
        ))}
      </div>
    </div>
  );
}

/* eslint-disable react/prop-types */
function Coin({ coin }) {
  const [isSelected, setIsSelected] = useState(false);

  const selectCss = isSelected
    ? "bg-primary text-white"
    : "bg-zinc-50 text-zinc-900";

  const handleSelection = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div
      className={`border rounded border-primary p-1.5 text-sm flex-1 ${selectCss}`}
      onClick={handleSelection}
    >
      <div className="flex items-center">
        <div className="text-base mr-1">
          <MoneyCollectOutlined />
        </div>
        <div>
          <div className="font-mono">
            <Satoshi value={coin.amount} />
          </div>
          <div className="text-sm opacity-80">
            <Satoshi value={coin.amount} flip />
          </div>
        </div>
      </div>
    </div>
  );
}
