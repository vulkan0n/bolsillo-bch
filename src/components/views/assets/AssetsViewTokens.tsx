import { useState, useEffect, useMemo, useCallback } from "react";
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

  const tokenUtxos = useMemo(() => {
    const UtxoManager = UtxoManagerService(walletHash);
    return UtxoManager.getWalletTokens();
  }, [walletHash]);

  const tokenCategories = useMemo(
    () =>
      tokenUtxos.reduce(
        (categories, utxo) =>
          !categories.includes(utxo.token_category)
            ? [...categories, utxo.token_category]
            : categories,
        []
      ),
    [tokenUtxos]
  );

  const getTokenAmounts = useCallback(
    (category) => {
      const amount = tokenUtxos
        .filter((utxo) => utxo.token_category === category)
        .reduce((total, utxo) => total + utxo.token_amount, 0);

      const nftCount = tokenUtxos.filter(
        (utxo) =>
          utxo.token_category === category && utxo.nft_capability !== null
      ).length;

      return { amount, nftCount };
    },
    [tokenUtxos]
  );

  const initializeIdentity = (category) => {
    const Bcmr = BcmrService();

    const colorHex = `#${category.slice(0, 6)}`;

    let identity = {
      name: `Token ${category.slice(0, 6)}`,
      color: colorHex,
    };

    try {
      identity = Bcmr.getIdentity(category);
    } catch (e) {
      // pass
    }

    return {
      category,
      ...getTokenAmounts(category),
      ...identity,
    };
  };

  const sortIdentities = useCallback((a, b) => {
    // sort tokens with metadata above tokens without metadata
    if (a.token && !b.token) {
      return -1;
    }

    if (b.token && !a.token) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  }, []);

  const [tokenData, setTokenData] = useState(
    tokenCategories.map(initializeIdentity).sort(sortIdentities)
  );

  useEffect(
    function resolveTokenMetadata() {
      const Bcmr = BcmrService();
      const resolve = async () => {
        const resolvedData = (
          await Promise.all(
            tokenCategories.map(async (category) => {
              const identity = await Bcmr.resolveIdentity(category);

              return {
                ...identity,
                ...getTokenAmounts(category),
              };
            })
          )
        ).sort(sortIdentities);

        setTokenData(resolvedData);
      };

      resolve();
    },
    [tokenCategories, tokenUtxos, getTokenAmounts, sortIdentities]
  );

  Log.debug(tokenData);

  const handleTokenNavigate = (tokenId) => {
    navigate(`/assets/tokens/${tokenId}`);
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
            <div onClick={() => handleTokenNavigate(token.category)}>
              <TokenCard token={token} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function TokenCard({ token }) {
  const truncateDescription = (text) => {
    // Match sentences ending with ., !, or ? followed by optional whitespace
    const sentences = text.match(/.*?[.!?]\s*/g);
    let selectedText;

    // Determine the text to use
    if (sentences) {
      if (sentences.length >= 2) {
        // Take the first two sentences
        selectedText = sentences[0] + sentences[1];
      } else {
        // Only one sentence available
        selectedText = sentences[0];
      }
    } else {
      // No sentence-ending punctuation; use the whole text
      selectedText = text;
    }

    // Remove trailing whitespace
    selectedText = selectedText.trim();

    // Truncate if necessary
    if (selectedText.length > 140) {
      const truncated = selectedText.slice(0, 140);
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > 0) {
        // Truncate at the last word boundary before 140 characters
        selectedText = `${truncated.slice(0, lastSpace)}...`;
      } else {
        // No space found; truncate at 140 and add "..."
        selectedText = `${truncated}...`;
      }
    }

    return selectedText;
  };

  return (
    <div
      key={token.category}
      className="w-full my-1 p-1 border border-primary rounded"
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
              {token.token ? token.token.symbol : token.category.slice(0, 6)}
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
  );
}
