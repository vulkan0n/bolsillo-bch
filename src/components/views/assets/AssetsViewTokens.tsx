import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { SendOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import { selectPrivacySettings } from "@/redux/preferences";
//import LogService from "@/services/LogService";
import TokenManagerService, {
  TokenEntity,
} from "@/services/TokenManagerService";
import DatabaseService from "@/services/DatabaseService";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import Button from "@/atoms/Button";

import { useClipboard } from "@/hooks/useClipboard";

import { truncateProse } from "@/util/string";
import { navigateOnValidUri } from "@/util/uri";

//const Log = LogService("AssetsViewTokens");

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

  const initTokenData = () =>
    tokenCategories
      .map((category) => TokenManager.getToken(category))
      .map((token) => ({
        ...token,
        ...TokenManager.calculateTokenAmounts(token.category),
      }))
      .sort(sortIdentities);

  const [tokenData, setTokenData] = useState(initTokenData());

  useEffect(
    function resolveTokenMetadata() {
      const resolve = async () => {
        const resolvedData = (
          await Promise.all(
            tokenCategories.map(async (category) => {
              let token;
              if (!shouldResolveBcmr) {
                token = TokenManager.getToken(category);
              } else {
                token = await TokenManager.resolveTokenData(category);
              }

              const amounts = TokenManager.calculateTokenAmounts(category);
              return { ...token, ...amounts };
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
    [tokenCategories, TokenManager, sortIdentities, shouldResolveBcmr]
  );

  //Log.debug(tokenData);

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

export function TokenCard({ token }: { token: TokenEntity }) {
  const navigate = useNavigate();
  const { handleCopyToClipboard, getClipboardContents } = useClipboard();

  const handleTokenSend = async () => {
    const { value, spawnPasteToast } = await getClipboardContents();

    const navTo = await navigateOnValidUri(value);
    if (navTo) {
      spawnPasteToast();
      navigate(navTo, {
        state: {
          tokenCategories: [token.category],
        },
      });
    }
  };

  return (
    <div
      key={token.category}
      className="w-full my-1 p-1 border border-primary rounded"
    >
      <div className="flex">
        <div className="flex items-center justify-center">
          <TokenIcon category={token.category} size={64} rounded />
        </div>
        <div className="flex flex-col justify-evenly mx-1.5 flex-1">
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
          <div className="flex items-center text-zinc-600 text-sm">
            {token.nftCount > 0 && <TokenAmount token={token} nft />}
            {token.amount > 0 && (
              <div className="flex flex-1 justify-between items-center">
                <TokenAmount token={token} />
                <span className="ml-2">
                  <Button
                    icon={SendOutlined}
                    iconSize="sm"
                    label="Send"
                    labelSize="xs"
                    borderClasses="border"
                    padding="1.5"
                    rounded="md"
                    shadow="sm"
                    onClick={handleTokenSend}
                    style={{ borderColor: token.color }}
                  />
                </span>
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
        <div
          className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate"
          onClick={(e) => {
            e.stopPropagation();
            handleCopyToClipboard(token.category);
          }}
        >
          {token.category}
        </div>
      </div>
    </div>
  );
}
