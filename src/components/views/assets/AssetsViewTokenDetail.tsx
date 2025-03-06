import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router";
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

import BcmrService from "@/services/BcmrService";
import TokenManagerService from "@/services/TokenManagerService";

import Checksum from "@/atoms/Checksum";
import NumberFormat from "@/atoms/NumberFormat";

export default function AssetsViewTokenDetail() {
  const { tokenId } = useParams();
  const { walletHash } = useSelector(selectActiveWallet);

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash),
    [walletHash]
  );
  const Bcmr = useMemo(() => BcmrService(), []);

  const [tokenData, setTokenData] = useState(
    TokenManager.getTokenData(tokenId)
  );

  useEffect(
    function resolveTokenMetadata() {
      const resolve = async () => {
        const data = TokenManager.getTokenData(tokenId);
        const identity = await Bcmr.resolveIdentity(tokenId);

        const resolvedData = {
          ...data,
          ...identity,
        };

        setTokenData(resolvedData);
      };

      resolve();
    },

    [TokenManager, tokenId, Bcmr]
  );

  const [shouldShowFullDescription, setShouldShowFullDescription] =
    useState(false);

  const uriIcons = {
    web: <LinkOutlined />,
    chat: <CommentOutlined />,
    app: <HomeOutlined />,
    blog: <LinkOutlined />,
    forum: <LinkOutlined />,
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
    default: <LinkOutlined />,
  };

  return (
    <div key={tokenData.category} className="w-full p-1">
      <div className="border rounded border-primary p-1">
        <div className="flex">
          <div className="flex items-center justify-center">
            <span className="border rounded-sm border-zinc-700 overflow-hidden">
              <Checksum data={tokenData.category} canvasSize={96} />
            </span>
          </div>
          <div className="flex flex-col flex-1 mx-1">
            <div className="">
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
                {tokenData.amount > 0 && (
                  <span className="text-sm font-mono mr-1.5 flex items-center">
                    <span
                      style={{ color: tokenData.color }}
                      className="relative bottom-[1px] pr-0.5 text-sm"
                    >
                      &#9679;
                    </span>
                    <NumberFormat
                      number={tokenData.amount}
                      decimals={
                        tokenData.token && tokenData.token.decimals
                          ? tokenData.token.decimals
                          : 0
                      }
                    />
                  </span>
                )}
                {tokenData.nftCount > 0 && (
                  <div className="text-sm flex items-center">
                    <span
                      style={{ color: tokenData.color }}
                      className="relative bottom-[1px] pr-0.5"
                    >
                      &#9635;
                    </span>
                    <span>{tokenData.nftCount}&nbsp;NFTs</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-end flex-1 text-zinc-500 gap-x-2 text-lg">
              {tokenData.uris &&
                Object.entries(tokenData.uris)
                  .filter(([k, v]) => !["icon", "image"].includes(k))
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
                  <div>{Bcmr.truncateDescription(tokenData.description)}</div>
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
    </div>
  );
}
