/* eslint-disable */
import { useState } from "react";
import { useSelector } from "react-redux";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";

const Log = LogService("AssetsViewHome");

export default function AssetsViewHome() {
  const wallet = useSelector(selectActiveWallet);

  const UtxoManager = UtxoManagerService(wallet);

  const utxos = UtxoManager.getWalletUtxos();
  const coins = UtxoManager.getWalletCoins();
  const tokens = UtxoManager.getWalletTokens();
  const nfts = tokens.filter((token) => token.nft_capability !== null);

  Log.debug(utxos, coins, tokens);

  const spendableBalance = coins.reduce(
    (total, utxo) => (total += utxo.amount),
    0
  );

  const tokenCategories = tokens.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category)
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  const nftCategories = tokens.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category) && utxo.nft_capability !== null
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  return (
    <div>
      <div>
        <div>
          Total Balance: <Satoshi value={wallet.balance} /> on {utxos.length}{" "}
          UTXOs
        </div>
        <div>
          Spendable Balance: <Satoshi value={spendableBalance} /> on{" "}
          {coins.length} UTXOs
        </div>
        <div>
          NFTs: {nfts.length} in {nftCategories.length} categories
        </div>
      </div>
      <div>
        Token Categories
        <ul>
          {tokenCategories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
