import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPrivacySettings } from "@/redux/preferences";
import LogService from "@/services/LogService";
import TokenManagerService from "@/services/TokenManagerService";
import DatabaseService from "@/services/DatabaseService";
import TokenIcon from "@/atoms/TokenIcon";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import NumberFormat from "@/atoms/NumberFormat";

import { truncateProse } from "@/util/string";

const Log = LogService("AssetsViewTokens");

export default function AssetsViewTokens() {
  // [?] use selectActiveWallet instead of selectActiveWalletHash
  // we want the UI to re-render on wallet update in case we send/receive tokens
  const { walletHash } = useSelector(selectActiveWallet);
  const { shouldResolveBcmr } = useSelector(selectPrivacySettings);

  const navigate = useNavigate();

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash),
    [walletHash]
  );

  const tokenCategories = useMemo(() => {
    return TokenManager.getTokenCategories();
  }, [TokenManager]);

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

  const [tokenData, setTokenData] = useState([]);

  useEffect(
    function resolveTokenMetadata() {
      const resolve = async () => {
        const resolvedData = (
          await Promise.all(
            tokenCategories.map(async (category) => {
              if (!shouldResolveBcmr) {
                return TokenManager.getToken(category);
              }
              return TokenManager.resolveTokenData(category);
            })
          )
        ).sort(sortIdentities);

        setTokenData(resolvedData);
      };

      resolve();

      return () => {
        // ensure resolved metadata persists in app db
        DatabaseService().flushDatabase("app");
      };
    },
    [tokenCategories, TokenManager, sortIdentities]
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

/* eslint-disable react/prop-types */
export function TokenCard({ token }) {
  return (
    <div
      key={token.category}
      className="w-full my-1 p-1 border border-primary rounded"
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <TokenIcon category={token.category} />
        </div>
        <div className="flex flex-col mx-1">
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
          <div className="flex items-center text-zinc-600">
            {token.amount > 0 && (
              <span className="text-xs font-mono mr-1.5 flex items-center">
                <span
                  style={{ color: token.color }}
                  className="relative bottom-[1px] pr-0.5 text-sm"
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
            {truncateProse(token.description)}
          </div>
        )}
        <div className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate">
          {token.category}
        </div>
      </div>
    </div>
  );
}
