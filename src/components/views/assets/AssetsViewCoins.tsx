import { useState } from "react";
import { useSelector } from "react-redux";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import UtxoManagerService from "@/services/UtxoManagerService";
//import LogService from "@/services/LogService";
import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";

//const Log = LogService("AssetsViewCoins");

export default function AssetsViewCoins() {
  const wallet = useSelector(selectActiveWallet);

  const UtxoManager = UtxoManagerService(wallet);
  const coins = UtxoManager.getWalletCoins();

  const [selection, setSelection] = useState([]);

  const handleFlipCurrency = useCurrencyFlip();

  const coinMap = coins.reduce((map, coin) => {
    if (!map[coin.address]) {
      /* eslint-disable-next-line no-param-reassign */
      map[coin.address] = [];
    }

    if (!coin.key) {
      /* eslint-disable-next-line no-param-reassign */
      coin.key = `${coin.txid}:${coin.tx_pos}`;
    }

    return {
      ...map,
      [coin.address]: [
        ...map[coin.address],
        {
          ...coin,
          selected: selection.findIndex((s) => s.key === coin.key) > -1,
        },
      ],
    };
  }, {});

  //Log.debug("coinMap", coinMap, selection);

  const coinAddresses = Object.keys(coinMap);

  const handleCoinSelection = (key, forceSelect) => {
    setSelection((currentSelection) => {
      const selectCoin = Object.values(coinMap)
        .flat()
        .find((coin) => coin.key === key);

      const selectIndex = currentSelection.findIndex(
        (coin) => coin.key === key
      );

      const newSelection =
        selectIndex === -1 &&
        (forceSelect === true || forceSelect === undefined)
          ? currentSelection.concat(selectCoin)
          : currentSelection.filter(
              (coin, i) => forceSelect === true || selectIndex !== i
            );

      //Log.debug("handleCoinSelection", key, forceSelect, newSelection);

      return newSelection;
    });
  };

  const selectedAmount = selection.reduce((sum, coin) => sum + coin.amount, 0);

  return (
    <>
      <div className="p-1">
        <div
          className="p-1 rounded bg-zinc-700 text-white text-center"
          onClick={handleFlipCurrency}
        >
          <div className="text-lg font-bold">Spendable Balance</div>
          <div>
            <Satoshi value={wallet.spendable_balance} />
          </div>
          <div className="text-sm flex items-center justify-center">
            <Satoshi value={wallet.spendable_balance} flip />
            <CurrencyFlip className="ml-1" />
          </div>
        </div>

        {coinAddresses.map((address) => (
          <CoinGroup
            address={address}
            coins={coinMap[address]}
            onCoinSelect={handleCoinSelection}
          />
        ))}
      </div>
      {selectedAmount > 0 && <SelectionDisplay amount={selectedAmount} />}
    </>
  );
}

/* eslint-disable react/prop-types */
function CoinGroup({ address, coins, onCoinSelect }) {
  const isSelected = coins.every((coin) => coin.selected);

  const selectCss = isSelected
    ? "bg-primary text-white"
    : "bg-zinc-500 text-zinc-200";

  const handleGroupSelection = () => {
    coins.forEach((coin) => onCoinSelect(coin.key, !isSelected));
  };

  return (
    <div
      className={`rounded my-1 border border-primary ${selectCss}`}
      onClick={handleGroupSelection}
    >
      <div className="py-0.5 px-1 font-mono text-xs">
        <Address address={address} color="white" />
      </div>
      <div className="m-0.5 shadow-inner border rounded border-primary">
        {coins.map((coin) => (
          <Coin key={coin.key} coin={coin} onSelect={onCoinSelect} />
        ))}
      </div>
    </div>
  );
}

function Coin({ coin, onSelect }) {
  const selectCss = coin.selected
    ? "bg-primary text-white"
    : "bg-zinc-50 text-zinc-900";

  const handleSelection = (event) => {
    onSelect(coin.key);
    event.stopPropagation();
  };

  return (
    <div
      className={`border p-1 text-sm flex-1 ${selectCss}`}
      onClick={handleSelection}
    >
      <div className="flex items-center">
        <MoneyCollectOutlined className="mr-1" />
        <div className="flex items-center justify-between w-full">
          <Satoshi value={coin.amount} />
          <span className="text-sm opacity-70">
            <Satoshi value={coin.amount} flip />
          </span>
        </div>
      </div>
    </div>
  );
}

function SelectionDisplay({ amount }) {
  return (
    <div className="sticky bottom-0 bg-black/70 w-full border-t-2 border-zinc-700 rounded-t shadow">
      <div className="text-zinc-700 rounded-t bg-white/85 shadow-lg px-2 py-1">
        <div className="text-center">
          <div className="text-lg font-semibold">Selected Amount</div>
          <div className="text-lg">
            <Satoshi value={amount} />
          </div>
          <div className="text-base">
            <Satoshi value={amount} flip />
          </div>
        </div>
      </div>
    </div>
  );
}
