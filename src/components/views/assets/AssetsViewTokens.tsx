/* eslint-disable */
import { useState } from "react";
import { useSelector } from "react-redux";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";

const Log = LogService("AssetsViewTokens");

export default function AssetsViewTokens() {
  const wallet = useSelector(selectActiveWallet);

  const UtxoManager = UtxoManagerService(wallet);

  const tokenUtxos = UtxoManager.getWalletTokens();
  const nfts = tokenUtxos.filter((token) => token.nft_capability !== null);

  const tokenCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category) && utxo.nft_capability === null
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  const tokenBalances = tokenCategories.map((category) => {
    const amount = tokenUtxos
      .filter((utxo) => utxo.token_category === category)
      .reduce((total, utxo) => (total += utxo.token_amount), 0);
    return { category, amount };
  });

  const nftCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category) && utxo.nft_capability !== null
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  Log.debug(tokenBalances, nftCategories);

  return (
    <div className="p-1">
      <div>
        {tokenBalances.map((token) => (
          <div key={token.category} className="w-full">
            <div className="flex justify-between items-center w-full my-1 p-2 border border-primary rounded">
              <div className="font-mono text-xs text-zinc-500 truncate px-1">
                {token.category}
              </div>
              <div className="px-1">{token.amount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
