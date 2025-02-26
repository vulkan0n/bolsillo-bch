import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectActiveWalletHash } from "@/redux/wallet";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import BcmrService from "@/services/BcmrService";
import Checksum from "@/atoms/Checksum";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import NumberFormat from "@/atoms/NumberFormat";

const Log = LogService("AssetsViewTokens");

export default function AssetsViewTokens() {
  const walletHash = useSelector(selectActiveWalletHash);

  const navigate = useNavigate();

  //const [tokenData, setTokenData] = useState([]);

  const UtxoManager = UtxoManagerService(walletHash);

  const tokenUtxos = UtxoManager.getWalletTokens();

  const tokenCategories = tokenUtxos.reduce(
    (categories, utxo) =>
      !categories.includes(utxo.token_category)
        ? [...categories, utxo.token_category]
        : categories,
    []
  );

  const Bcmr = BcmrService();
  useEffect(
    function resolveTokenMetadata() {
      const resolve = async () =>
        Promise.all(
          tokenCategories.map((category) => Bcmr.resolveIdentity(category))
        );

      //resolve();
    },
    [Bcmr, tokenCategories]
  );

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
      // sort tokens with metadata above tokens without metadata
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
    //navigate(`/assets/tokens/${tokenId}`);
  };

  return (
    <div className="p-1">
      <KeyWarning walletHash={walletHash} />
      {tokenData.length === 0 ? (
        <div className="text-center py-4 rounded text-2xl text-zinc-600/80 my-8">
          No Tokens
        </div>
      ) : (
        <>
          {tokenData.map((token) => (
            <div
              key={token.category}
              className="w-full my-1 p-1 border border-primary rounded"
              onClick={() => handleTokenNavigate(token.category)}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center">
                  <span className="border rounded-sm border-zinc-700 overflow-hidden">
                    <Checksum data={token.category} />
                  </span>
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
                      <span className="text-xs font-mono mr-1.5 flex items-center">
                        <span
                          style={{ color: token.color }}
                          className="relative bottom-[1px] pr-0.5"
                        >
                          &#9679;
                        </span>
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
        </>
      )}
    </div>
  );
}
