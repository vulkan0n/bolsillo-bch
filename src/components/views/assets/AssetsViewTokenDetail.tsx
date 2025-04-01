import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router";
import { DateTime } from "luxon";
import {
  CloseOutlined,
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
  SendOutlined,
} from "@ant-design/icons";

import { TelegramFilled } from "@/atoms/TelegramFilled";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import Button from "@/atoms/Button";
import FullColumn from "@/layout/FullColumn";

import { selectActiveWallet } from "@/redux/wallet";

//import LogService from "@/services/LogService";
import TokenManagerService from "@/services/TokenManagerService";

import { truncateProse } from "@/util/string";
import { navigateOnValidUri } from "@/util/uri";

import { useTokenData } from "@/hooks/useTokenData";
import { useClipboard } from "@/hooks/useClipboard";

//const Log = LogService("AssetsViewTokenDetail");

export default function AssetsViewTokenDetail() {
  const { tokenId: paramsTokenId } = useParams();
  const { walletHash } = useSelector(selectActiveWallet);

  const navigate = useNavigate();
  const { handleCopyToClipboard, getClipboardContents } = useClipboard();

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash),
    [walletHash]
  );

  const tokenId = paramsTokenId || "";

  const tokenData = useTokenData(tokenId, true);

  //Log.debug(tokenData);

  const [shouldShowFullDescription, setShouldShowFullDescription] =
    useState(false);

  const [nftSelection, setNftSelection] = useState([]);

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

  const handleTokenSend = async () => {
    const { value, spawnPasteToast } = await getClipboardContents();
    const navTo = await navigateOnValidUri(value);
    if (navTo) {
      spawnPasteToast();
      navigate(navTo, {
        state: {
          selection: nftSelection,
          tokenCategories: [tokenId],
        },
      });
    }
  };

  const handleNftSelect = (utxo) => {
    const selectIndex = nftSelection.findIndex(
      (nft) => nft.txid === utxo.txid && nft.tx_pos === utxo.tx_pos
    );
    if (selectIndex > -1) {
      const newSelection = nftSelection.toSpliced(selectIndex, 1);
      setNftSelection(newSelection);
      return;
    }

    setNftSelection([...nftSelection, utxo]);
  };

  const handleSelectionCancel = () => setNftSelection([]);
  const handleSelectionConfirm = () => {
    navigate("/wallet/send", {
      state: {
        selection: nftSelection,
        tokenCategories: [tokenId],
      },
    });
  };

  return (
    <FullColumn key={tokenData.category} className="justify-between">
      <div className="p-1">
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
            <div className="flex flex-col flex-1 mx-1.5 justify-evenly">
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

                <div className="flex items-center text-zinc-600 gap-x-2 text-sm">
                  {tokenData.nftCount > 0 && (
                    <TokenAmount token={tokenData} nft />
                  )}
                  {tokenData.amount > 0 && <TokenAmount token={tokenData} />}

                  {(tokenData.amount > 0 || nftSelection.length > 0) && (
                    <span className="flex grow justify-end">
                      <Button
                        icon={SendOutlined}
                        iconSize="sm"
                        label="Send"
                        labelSize="xs"
                        borderClasses="border"
                        padding="1.5"
                        rounded="md"
                        onClick={handleTokenSend}
                        style={{ borderColor: tokenData.color }}
                      />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-end gap-x-2 text-lg text-zinc-500 text-lg">
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
          <div
            className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyToClipboard(token.category);
            }}
          >
            {tokenData.category}
          </div>
        </div>

        <div className="mt-1">
          <ul className="border rounded-sm border-zinc-300 max-h-[25%] overflow-y-scroll h-full shadow-inner">
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
                            <TokenAmount token={{ ...h, ...tokenData.token }} />
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

          <div className="mt-1 pb-3 flex flex-wrap flex-1 gap-1 justify-around">
            {nfts.map((utxo) => {
              const nftData = tokenData.token.nfts
                ? tokenData.token.nfts.parse.types[utxo.nft_commitment]
                : null;

              const isSelected =
                nftSelection.findIndex(
                  (nft) => nft.txid === utxo.txid && nft.tx_pos === utxo.tx_pos
                ) > -1;

              const bgClass = isSelected ? "bg-primary" : "";
              const borderClass = isSelected ? "border-primary" : "";

              return (
                <div
                  className={`border rounded-t rounded-b-sm items-center w-full sm:max-w-[49%] ${borderClass}`}
                  style={isSelected ? {} : { borderColor: tokenData.color }}
                  onClick={() => handleNftSelect(utxo)}
                >
                  <div
                    style={
                      isSelected
                        ? {}
                        : { backgroundColor: `${tokenData.color}AA` }
                    }
                    className={`truncate text-white font-semibold px-0.5 text-stroke ${bgClass}`}
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
      </div>
      {nftSelection.length > 0 && (
        <SelectionDisplay
          selection={nftSelection}
          onConfirm={handleSelectionConfirm}
          onCancel={handleSelectionCancel}
        />
      )}
    </FullColumn>
  );
}

/* eslint-disable react/prop-types */
function SelectionDisplay({ selection, onConfirm, onCancel }) {
  const selectedAmount = selection.length;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="sticky bottom-0 bg-black/70 w-full border-t-2 border-zinc-700 rounded-t shadow mt-1">
      <div className="text-zinc-700 rounded-t bg-white/85 shadow-lg px-3 py-3">
        <div className="flex relative justify-between">
          <div className="flex items-center justify-start flex-1">
            <Button
              onClick={handleCancel}
              icon={CloseOutlined}
              iconSize="lg"
              bgColor="transparent"
              activeBgColor="x active:bg-zinc-100"
              borderClasses="border border-transparent"
            />
          </div>
          <div className="text-center grow flex items-center justify-center font-bold text-lg">
            {selectedAmount} NFTs selected
          </div>
          <div className="flex items-center justify-end flex-1">
            <Button
              icon={SendOutlined}
              iconSize="lg"
              label="Send"
              padding="2"
              rounded="md"
              onClick={handleConfirm}
              inverted
            />
          </div>
        </div>
      </div>
    </div>
  );
}
