import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  MoneyCollectOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import FullColumn from "@/layout/FullColumn";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import CurrencyFlip from "@/atoms/CurrencyFlip";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import UtxoManagerService from "@/services/UtxoManagerService";
//import LogService from "@/services/LogService";
import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";

//const Log = LogService("AssetsViewCoins");

export default function AssetsViewCoins() {
  const wallet = useSelector(selectActiveWallet);
  const navigate = useNavigate();

  const UtxoManager = UtxoManagerService(wallet.walletHash);
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

  const handleSelectionCancel = () => {
    setSelection([]);
  };

  const handleSelectionConfirm = () => {
    navigate("/wallet/send", {
      state: {
        selection,
      },
    });
    setSelection([]);
  };

  return (
    <FullColumn className="justify-between">
      <div className="m-1">
        <div
          className="p-1 rounded bg-zinc-800 text-white text-center my-1"
          onClick={handleFlipCurrency}
        >
          <div className="text-lg font-bold">Cash Balance</div>
          <div>
            <Satoshi value={wallet.spendable_balance} />
          </div>
          <div className="text-sm flex items-center justify-center">
            <Satoshi value={wallet.spendable_balance} flip />
            <CurrencyFlip className="ml-1" />
          </div>
        </div>

        <KeyWarning walletHash={wallet.walletHash} />

        {coinAddresses.map((address) => (
          <CoinGroup
            address={address}
            coins={coinMap[address]}
            onCoinSelect={handleCoinSelection}
          />
        ))}

        {coinAddresses.length === 0 && (
          <div className="text-center py-4 rounded text-2xl text-zinc-600/80 my-4">
            No Coins
          </div>
        )}
      </div>
      {selection.length > 0 && (
        <SelectionDisplay
          selection={selection}
          onConfirm={handleSelectionConfirm}
          onCancel={handleSelectionCancel}
        />
      )}
    </FullColumn>
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
          <span className="text-sm opacity-75">
            <Satoshi value={coin.amount} flip />
          </span>
        </div>
      </div>
    </div>
  );
}

function SelectionDisplay({ selection, onConfirm, onCancel }) {
  const selectedAmount = selection.reduce((sum, coin) => sum + coin.amount, 0n);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="sticky bottom-0 bg-black/70 w-full border-t-2 border-zinc-700 rounded-t shadow mt-1">
      <div className="text-zinc-700 rounded-t bg-white/85 shadow-lg px-2 py-1">
        <div className="flex relative justify-between">
          <div className="flex items-center justify-start flex-1">
            <Button
              onClick={handleCancel}
              icon={CloseOutlined}
              bgColor="transparent"
              activeBgColor="x active:bg-zinc-100"
              borderClasses="border border-transparent"
            />
          </div>
          <div className="text-center grow">
            <div className="text-lg font-semibold">Selected Amount</div>
            <div className="text-lg">
              <Satoshi value={selectedAmount} />
            </div>
            <div className="text-base">
              <Satoshi value={selectedAmount} flip />
            </div>
          </div>
          <div className="flex items-center justify-end flex-1">
            <Button
              onClick={handleConfirm}
              icon={SendOutlined}
              iconSize="lg"
              label="Send"
              activeLabelColor="white/90"
              labelColor="primary"
              borderClasses="border border-transparent"
              inverted
            />
          </div>
        </div>
      </div>
    </div>
  );
}
