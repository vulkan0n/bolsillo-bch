import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router";
import { DateTime } from "luxon";
import {
  LinkOutlined,
  HomeOutlined,
  CommentOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  AuditOutlined,
  DockerOutlined,
  InstagramOutlined,
  XOutlined,
  DiscordFilled,
  FacebookFilled,
  RedditCircleFilled,
  YoutubeFilled,
} from "@ant-design/icons";

import { TelegramFilled } from "@/atoms/TelegramFilled";

import { selectActiveWallet } from "@/redux/wallet";

import LogService from "@/services/LogService";
import TokenManagerService from "@/services/TokenManagerService";

import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";

import { truncateProse } from "@/util/string";

const Log = LogService("AssetsViewTokenDetail");

export default function AssetsViewTokenDetail() {
  const { tokenId: paramsTokenId } = useParams();
  const { walletHash } = useSelector(selectActiveWallet);

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash),
    [walletHash]
  );

  const tokenId = paramsTokenId || "";

  const tokenData = TokenManager.getToken(tokenId);
  Log.debug(tokenData);

  const [shouldShowFullDescription, setShouldShowFullDescription] =
    useState(false);

  const uriIcons = {
    default: <LinkOutlined />,
    web: <LinkOutlined />,
    app: <HomeOutlined />,
    chat: <CommentOutlined />,
    registry: <AuditOutlined />,
    support: <QuestionCircleOutlined />,
    discord: <DiscordFilled />,
    facebook: <FacebookFilled />,
    docker: <DockerOutlined />,
    git: <CodeOutlined />,
    instagram: <InstagramOutlined />,
    twitter: <XOutlined />,
    x: <XOutlined />,
    telegram: <TelegramFilled />,
    reddit: <RedditCircleFilled />,
    youtube: <YoutubeFilled />,
  };

  const [tokenHistory, setTokenHistory] = useState([]);

  useEffect(
    function resolveTokenHistory() {
      const resolve = async () => {
        const history = await TokenManager.resolveTokenHistory(tokenId);
        setTokenHistory(history);
      };
      resolve();
    },
    [TokenManager, tokenId]
  );

  const tokenUtxos = TokenManager.getTokenUtxos(tokenId);
  const nfts = tokenUtxos.filter((utxo) => utxo.nft_capability !== null);

  return (
    <div key={tokenData.category} className="w-full p-1">
      <div className="border rounded border-primary p-1">
        <div className="flex">
          <div className="flex items-center justify-center">
            <span
              className="border border-2 rounded-sm overflow-hidden shadow-sm"
              style={{ borderColor: tokenData.color }}
            >
              <TokenIcon category={tokenData.category} size={96} />
            </span>
          </div>
          <div className="flex flex-col flex-1 mx-1.5">
            <div>
              <div className="flex items-baseline">
                <span
                  className="font-mono text-sm font-bold pr-1.5 mr-1.5 border-r border-zinc-400/90"
                  style={{ color: tokenData.color }}
                >
                  {tokenData.token
                    ? tokenData.token.symbol
                    : tokenData.category.slice(0, 6)}
                </span>
                <span className="font-bold text-zinc-700">
                  {tokenData.name}
                </span>
              </div>
              <div className="flex items-center text-zinc-600 py-0.5">
                {tokenData.amount > 0 && <TokenAmount token={tokenData} />}
                {tokenData.nftCount > 0 && (
                  <TokenAmount token={tokenData} nft />
                )}
              </div>
            </div>
            <div className="flex items-end flex-1 text-zinc-500 gap-x-2 text-lg">
              {tokenData.uris &&
                Object.entries(tokenData.uris)
                  .filter(([k]) => !["icon", "image"].includes(k))
                  .map(([k, v]) => {
                    return (
                      <Link to={v}>{uriIcons[k] || uriIcons.default}</Link>
                    );
                  })}
            </div>
          </div>
        </div>
        <div>
          {tokenData.description && (
            <div
              className="p-1 text-sm text-zinc-700 border-t border-dashed border-zinc-300/80 mt-1"
              onClick={() =>
                setShouldShowFullDescription(!shouldShowFullDescription)
              }
            >
              {tokenData.description.length <= 140 ||
              shouldShowFullDescription ? (
                tokenData.description
              ) : (
                <>
                  <div>{truncateProse(tokenData.description)}</div>
                  <div className="text-right text-xs">See More &gt;</div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate">
          {tokenData.category}
        </div>
      </div>
      <div className="mt-1">
        <ul className="border rounded-sm border-zinc-300 max-h-[20vh] overflow-y-auto shadow-inner">
          {tokenHistory.map((h) => (
            <li key={h.txid} className="py-1">
              <Link to={`/explore/tx/${h.txid}`}>
                <div className="flex text-sm p-1">
                  <div className="flex-1">
                    {(h.height <= 0 || !h.time
                      ? DateTime.fromISO(h.time_seen)
                      : DateTime.fromSeconds(h.time)
                    ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
                  </div>
                  <div className="text-right">
                    {h.nft_amount !== 0 && <TokenAmount token={h} nft />}
                    {h.fungible_amount !== 0 && (
                      <div className="font-mono">
                        <span className="text-sm font-mono flex items-center justify-end">
                          <TokenAmount
                            token={h}
                            decimals={tokenData.token.decimals}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {h.memo && (
                  <div className="text-sm text-zinc-500 ml-4">
                    Memo: {h.memo}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-1 flex flex-wrap gap-1 justify-around">
        {nfts.map((utxo) => {
          const nftData = tokenData.token.nfts
            ? tokenData.token.nfts.parse.types[utxo.nft_commitment]
            : null;

          return (
            <div
              className="border rounded-t rounded-b-sm items-center max-w-[174px]"
              style={{ borderColor: tokenData.color }}
            >
              <div
                style={{ backgroundColor: `${tokenData.color}AA` }}
                className="truncate text-white font-semibold px-0.5 text-stroke"
              >
                {nftData && nftData.name && (
                  <span className="px-0.5">{nftData.name}</span>
                )}
              </div>
              <div className="flex">
                <div className="p-0.5">
                  <TokenIcon
                    category={utxo.token_category}
                    nft_commitment={utxo.nft_commitment}
                  />
                </div>
                <div className="truncate px-1">
                  {nftData && nftData.description ? (
                    <span className="text-sm text-zinc-700 text-wrap">
                      {truncateProse(nftData.description)}
                    </span>
                  ) : (
                    <span className="break-all text-wrap text-xs tracking-tight font-mono">
                      {utxo.nft_commitment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
