/* eslint-disable */
import { useState } from "react";
import { useSelector } from "react-redux";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";

const Log = LogService("AssetsViewCollections");

export default function AssetsViewCollections() {
  const wallet = useSelector(selectActiveWallet);

  const UtxoManager = UtxoManagerService(wallet);

  const tokenUtxos = UtxoManager.getWalletTokens();
  const nftUtxos = tokenUtxos.filter((utxo) => utxo.nft_capability !== null);

  const nftCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category) && utxo.nft_capability !== null
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  const nftTotals = nftCategories.map((category) => {
    const count = nftUtxos.filter(
      (utxo) => utxo.token_category === category
    ).length;
    return { category, count };
  });

  Log.debug(nftTotals);

  return (
    <div className="p-1">
      <div className="bg-zinc-800 text-white rounded-lg p-2">
        <div className="flex flex-col gap-y-2">
          <div>
            NFTs: {nftUtxos.length} in {nftCategories.length} categories
          </div>
        </div>
      </div>
      <div>
        {nftTotals.map((nft) => (
          <div key={nft.category} className="border border-primary rounded">
            <div className="font-mono text-xs text-zinc-500 truncate px-1">
              {nft.category}
            </div>
            <div className="p-8 border border-zinc-700 rounded">&nbsp;</div>
            <div className="px-1">{nft.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
