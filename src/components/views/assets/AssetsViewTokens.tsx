/* eslint-disable */
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { importMetadataRegistry, IdentityHistory } from "@bitauth/libauth";
import { MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import Checksum from "@/atoms/Checksum";
import NumberFormat from "@/atoms/NumberFormat";

const Log = LogService("AssetsViewTokens");

export default function AssetsViewTokens() {
  const wallet = useSelector(selectActiveWallet);

  const navigate = useNavigate();

  const UtxoManager = UtxoManagerService(wallet);

  const tokenUtxos = UtxoManager.getWalletTokens();
  const nfts = tokenUtxos.filter((token) => token.nft_capability !== null);

  const tokenCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category)
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  const Bcmr = BcmrService();

  const tokenData = tokenCategories
    .map((category) => {
      let identity = {
        name: `Token ${category.slice(0, 6)}`,
      };

      try {
        identity = Bcmr.getIdentity(category);
      } catch (e) {}

      const amount = tokenUtxos
        .filter((utxo) => utxo.token_category === category)
        .reduce((total, utxo) => (total += utxo.token_amount), 0);

      const nftCount = tokenUtxos.filter(
        (utxo) =>
          utxo.token_category === category && utxo.nft_capability !== null
      ).length;

      const colorHex = `#${category.slice(0, 6)}`;

      return {
        category,
        color: colorHex,
        amount,
        nftCount,
        ...identity,
      };
    })
    .sort((a, b) => {
      if (a.token && !b.token) {
        return -1;
      }

      if (b.token && !a.token) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

  Log.debug(tokenData);

  const truncateDescription = (text) => {
    const textSplit = text.split(".");
    const textCat = [textSplit[0], textSplit[1]].join(".");
    const len = textCat.length;

    return len > 137
      ? textCat.slice(0, 140) + "..."
      : textCat + (textCat.endsWith(".") ? "" : ".");
  };

  const handleTokenNavigate = (tokenId) => {
    navigate(`/assets/tokens/${tokenId}`);
  };

  return (
    <div className="p-1">
      {tokenData.map((token) => (
        <div
          key={token.category}
          className="w-full my-1 p-1 border border-primary rounded"
          onClick={() => handleTokenNavigate(token.category)}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center">
              <Checksum data={token.category} />
            </div>
            <div className="flex flex-col justify-between mx-1">
              <div className="text-sm flex items-baseline">
                <span
                  className="font-mono text-xs font-bold pr-1.5 mr-1.5 border-r border-zinc-400/90"
                  style={{ color: token.color }}
                >
                  {token.token
                    ? token.token.symbol
                    : token.category.slice(0, 6)}
                </span>
                <span className="font-bold text-zinc-700">
                  {token.name || `Token ${token.category.slice(0, 6)}`}
                </span>
              </div>
              <div className="flex items-center text-zinc-600 mt-0.5">
                {token.amount > 0 && (
                  <span
                    className="text-xs font-mono border-dotted border-l-8 pl-0.5 mr-1.5"
                    style={{ borderColor: token.color }}
                  >
                    <NumberFormat
                      number={token.amount}
                      decimals={
                        token.token && token.token.decimals
                          ? token.token.decimals
                          : 0
                      }
                    />
                  </span>
                )}
                {token.nftCount > 0 && (
                  <div className="text-xs flex items-center">
                    <span
                      style={{ color: token.color }}
                      className="relative bottom-[1px] pr-0.5"
                    >
                      &#9635;
                    </span>
                    <span>{token.nftCount}&nbsp;NFTs</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            {token.description && (
              <div className="p-1 text-sm text-zinc-700">
                {truncateDescription(token.description)}
              </div>
            )}
            <div className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate">
              {token.category}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
