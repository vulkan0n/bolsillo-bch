import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router";
import { SendOutlined, SyncOutlined } from "@ant-design/icons";
import {
  selectPrivacySettings,
  selectIsDarkMode,
  selectBchNetwork,
} from "@/redux/preferences";
//import LogService from "@/services/LogService";
import TokenManagerService, {
  TokenEntity,
} from "@/services/TokenManagerService";
import DatabaseService from "@/services/DatabaseService";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";

import { useClipboard } from "@/hooks/useClipboard";

import { truncateProse } from "@/util/string";
import { validateBchUri } from "@/util/uri";

import { translate } from "@/util/translations";
import translations from "./translations";

//const Log = LogService("AssetsViewTokens");

export default function AssetsViewTokens() {
  const { walletHash } = useOutletContext();
  const bchNetwork = useSelector(selectBchNetwork);
  const { shouldResolveBcmr } = useSelector(selectPrivacySettings);

  const navigate = useNavigate();

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash, bchNetwork),
    [walletHash, bchNetwork]
  );

  const tokenCategories = useMemo(() => {
    return TokenManager.getTokenCategories();
  }, [TokenManager]);

  const sortIdentities = useCallback((a, b) => {
    // sort tokens with metadata above tokens without metadata
    const hasMetadata = (w) => w.token && w.symbol !== w.category.slice(0, 6);

    if (hasMetadata(a) && !hasMetadata(b)) {
      return -1;
    }

    if (hasMetadata(b) && !hasMetadata(a)) {
      return 1;
    }

    return a.symbol.localeCompare(b.symbol);
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

  const [isResolvingTokenData, setIsResolvingTokenData] = useState(false);

  useEffect(
    function resolveTokenMetadata() {
      const resolve = async () => {
        const resolvedData = (
          await Promise.allSettled(
            tokenCategories.map(async (category) => {
              let token;
              if (!shouldResolveBcmr) {
                token = TokenManager.getToken(category);
              } else {
                setIsResolvingTokenData(true);
                token = await TokenManager.resolveTokenData(category);
              }

              const amounts = TokenManager.calculateTokenAmounts(category);
              return { ...token, ...amounts };
            })
          )
        )
          .filter((d) => d.status === "fulfilled")
          .map((d) => d.value)
          .sort(sortIdentities);

        setTokenData(resolvedData);
        setIsResolvingTokenData(false);
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
        <div className="text-center py-4 rounded text-2xl text-neutral-700/90 dark:text-neutral-200 my-4">
          {translate(translations.noTokens)}
          <div className="flex justify-center items-center mt-4">
            <SeleneLogo className="h-32" cashtokens />
          </div>
        </div>
      ) : (
        <>
          {isResolvingTokenData && (
            <div className="flex justify-center items-center p-1">
              <SyncOutlined className="text-lg mr-1" spin />
              {translate(translations.downloadingTokenData)}
            </div>
          )}
          {tokenData.map((token) => (
            <div
              key={token.category}
              onClick={() => handleTokenNavigate(token.category)}
              className="flex flex-col gap-y-1"
            >
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

  const isDarkMode = useSelector(selectIsDarkMode);

  const handleTokenSend = async () => {
    const { paste, spawnPasteToast } = await getClipboardContents();
    const { isBip21, address, query } = validateBchUri(paste);

    let navTo = "/wallet/send/";
    if (isBip21) {
      spawnPasteToast();
      navTo = [navTo, address, query].join("");
    }

    navigate(navTo, {
      state: {
        tokenCategories: [token.category],
      },
    });
  };

  return (
    <div
      key={token.category}
      className="w-full my-1 border border-primary rounded bg-primary-50 dark:bg-neutral-800 dark:border-primarydark-400"
    >
      <div className="flex p-1">
        <div className="w-fit h-fit mr-1">
          <TokenIcon category={token.category} size={72} rounded />
        </div>
        <div className="flex-1 p-1">
          <div className="flex items-center text-md mb-1 py-0.5">
            <span
              className="font-mono text-md font-bold pr-1.5 mr-1.5 border-r border-neutral-400/90"
              style={{ color: token.color }}
            >
              {token.token ? token.token.symbol : token.category.slice(0, 6)}
            </span>
            <span className="font-bold text-lg text-neutral-700 dark:text-neutral-100">
              {token.name || `Token ${token.category.slice(0, 6)}`}
            </span>
          </div>
          <div className="flex text-neutral-600 dark:text-neutral-100">
            <div className="flex-1">
              {token.nftCount > 0 && <TokenAmount token={token} nft />}
              {token.amount > 0 && (
                <div className="flex flex-1 justify-between items-center">
                  <TokenAmount token={token} />
                </div>
              )}
            </div>

            {token.amount > 0 && (
              <Button
                icon={SendOutlined}
                iconSize="lg"
                label={translate(translations.send)}
                labelSize="md"
                borderClasses="border border-primary"
                rounded="md"
                shadow="sm"
                padding="2"
                onClick={handleTokenSend}
              />
            )}
          </div>
        </div>
      </div>
      <div>
        {token.description && (
          <div className="p-2 text-md text-neutral-700 dark:text-neutral-100 dark:bg-neutral-700 rounded-sm">
            {truncateProse(token.description)}
          </div>
        )}
      </div>
      <div
        className="pt-0.5 px-0.5 border-t border-dashed border-neutral-300/80 font-mono text-xs text-neutral-400/70 dark:text-white/65 truncate"
        style={{ backgroundColor: `${token.color}${isDarkMode ? "80" : "20"}` }}
        onClick={(e) => {
          e.stopPropagation();
          handleCopyToClipboard(
            token.category,
            translate(translations.copiedTokenId)
          );
        }}
      >
        {token.category}
      </div>
    </div>
  );
}
