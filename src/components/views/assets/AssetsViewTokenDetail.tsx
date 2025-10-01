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
  ArrowRightOutlined,
} from "@ant-design/icons";

import { TelegramFilled } from "@/icons/TelegramFilled";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import Button from "@/atoms/Button";
import FullColumn from "@/layout/FullColumn";

import { selectActiveWallet } from "@/redux/wallet";

//import LogService from "@/services/LogService";
import TokenManagerService from "@/services/TokenManagerService";

import { truncateProse } from "@/util/string";
import { validateBchUri } from "@/util/uri";

import { useTokenData } from "@/hooks/useTokenData";
import { useClipboard } from "@/hooks/useClipboard";

import { translate } from "@/util/translations";
import translations from "./translations";

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
    const { paste, spawnPasteToast } = await getClipboardContents();
    const { isBip21, address, query } = validateBchUri(paste);

    let navTo = "/wallet/send/";
    if (isBip21) {
      spawnPasteToast();
      navTo = [navTo, address, query].join("");
    }

    navigate(navTo, {
      state: {
        nftSelection,
        tokenCategories: [tokenId],
      },
    });
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
  const handleSelectionConfirm = handleTokenSend;

  return (
    <FullColumn key={tokenData.category} className="justify-between  ">
      <div className="p-1">
        <div className="border rounded border-primary p-1">
          <div className="flex">
            <div
              className="border border-2 rounded-sm overflow-hidden shadow-sm w-fit h-fit"
              style={{ borderColor: tokenData.color }}
            >
              <TokenIcon category={tokenData.category} size={96} />
            </div>
            <div className="flex flex-col flex-1 mx-1.5 justify-evenly">
              <div>
                <span
                  className="font-mono text-md font-bold pr-1.5 mr-1.5 border-r border-neutral-400/90"
                  style={{ color: tokenData.color }}
                >
                  {tokenData.token
                    ? tokenData.token.symbol
                    : tokenData.category.slice(0, 6)}
                </span>
                <span className="font-bold text-lg text-neutral-700 dark:text-neutral-100">
                  {tokenData.name}
                </span>
              </div>

              <div className="flex items-center text-neutral-600 gap-x-2 text-md dark:text-neutral-200">
                {tokenData.nftCount > 0 && (
                  <TokenAmount token={tokenData} nft />
                )}
                {tokenData.amount > 0 && <TokenAmount token={tokenData} />}
              </div>

              <div className="flex flex-1 flex-wrap items-end gap-3 text-neutral-500 dark:text-neutral-200 text-[1.667em]">
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
                className="p-1 text-md text-neutral-700 dark:text-neutral-100 border-t border-dashed border-neutral-300/80 mt-1"
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
                    <div className="text-right text-sm cursor-pointer flex justify-end">
                      <span className="border-b border-dotted border-neutral-400 flex items-center shrink justify-end w-fit">
                        {translate(translations.seeMore)}
                        <ArrowRightOutlined className="ml-1" />
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div
            className="mt-1.5 pt-0.5 border-t border-dashed border-neutral-300/80 font-mono text-sm text-neutral-400/70 dark:text-neutral-200 truncate"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyToClipboard(token.category);
            }}
          >
            {tokenData.category}
          </div>
        </div>

        {nfts.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1 justify-around dark:text-neutral-100">
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
                        <span className="text-sm text-neutral-700 text-wrap">
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
        ) : (
          <div className="border rounded-sm border-neutral-300 shadow-inner dark:text-neutral-100 mt-2">
            {tokenHistory.map(
              (h, i) =>
                i < 50 && (
                  <div key={h.txid} className="py-1">
                    <Link to={`/explore/tx/${h.txid}`}>
                      <div className="flex text-sm p-1">
                        <div className="flex-1">
                          {(h.height <= 0 || !h.time
                            ? DateTime.fromISO(h.time_seen)
                            : DateTime.fromSeconds(h.time)
                          ).toLocaleString(
                            DateTime.DATETIME_SHORT_WITH_SECONDS
                          )}
                        </div>
                        <div className="text-right">
                          {h.nft_amount !== 0 && <TokenAmount token={h} nft />}
                          {h.fungible_amount !== 0 && (
                            <div className="font-mono">
                              <span className="text-sm font-mono flex items-center justify-end">
                                <TokenAmount
                                  token={{ ...h, ...tokenData.token }}
                                />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {h.memo && (
                        <div className="text-sm text-neutral-500 ml-4">
                          {translate(translations.memo)}: {h.memo}
                        </div>
                      )}
                    </Link>
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {tokenData.amount > 0 && (
        <div className="sticky bottom-0 bg-black/80 w-full border-t-2 border-neutral-700 rounded-t shadow mt-1">
          <div className="text-neutral-700 rounded-t bg-white/85 dark:bg-neutral-800 shadow-lg">
            <div className="flex items-center p-2 mb-1">
              <Button
                icon={SendOutlined}
                iconSize="xl"
                label={translate(translations.sendTokens)}
                labelSize="lg"
                borderClasses="border border-primary border-2"
                rounded="md"
                inverted
                onClick={handleTokenSend}
                fullWidth
              />
            </div>
          </div>
        </div>
      )}
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
    <div className="sticky bottom-0 bg-black/70 w-full border-t-2 border-neutral-700 rounded-t shadow mt-1">
      <div className="text-neutral-700 rounded-t bg-white/85 shadow-lg px-3 py-3">
        <div className="flex relative justify-between">
          <div className="flex items-center justify-start flex-1">
            <Button
              onClick={handleCancel}
              icon={CloseOutlined}
              iconSize="lg"
              bgColor="transparent"
              activeBgColor="x active:bg-neutral-100"
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
