import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";

import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";
import Button from "@/atoms/Button";
import FullColumn from "@/layout/FullColumn";
import TokenCard from "@/composite/TokenCard";

import { selectActiveWallet } from "@/redux/wallet";
import { selectBchNetwork } from "@/redux/preferences";

//import LogService from "@/kernel/app/LogService";
import TokenManagerService from "@/kernel/wallet/TokenManagerService";

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
  const bchNetwork = useSelector(selectBchNetwork);

  const navigate = useNavigate();
  const { getClipboardContents } = useClipboard();

  const TokenManager = useMemo(
    () => TokenManagerService(walletHash, bchNetwork),
    [walletHash, bchNetwork]
  );

  const tokenId = paramsTokenId || "";

  const tokenData = useTokenData(tokenId, true);

  //Log.debug(tokenData);

  const [nftSelection, setNftSelection] = useState([]);

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
    <FullColumn key={tokenData.category} className="justify-between">
      <div className="p-1">
        <TokenCard token={tokenData} detail nftSelection={nftSelection} />

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

              const bgClass = isSelected
                ? "bg-primary dark:bg-primary-700"
                : "bg-primary-100 dark:bg-primarydark-50";

              const borderClass = isSelected
                ? "border-primary dark:border-primary-900"
                : "";

              return (
                <div
                  className={`border rounded-t rounded-b-sm items-center w-full sm:max-w-[49%] ${borderClass} ${bgClass}`}
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
                    <TokenIcon
                      category={utxo.token_category}
                      nft_commitment={utxo.nft_commitment}
                    />
                    <div className="flex flex-col justify-between w-full">
                      <div className="flex truncate px-1">
                        {nftData && nftData.description && (
                          <span className="text-sm text-neutral-700 dark:text-neutral-100/90 text-wrap">
                            {truncateProse(nftData.description)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="break-all text-wrap text-xs tracking-tight font-mono text-neutral-500 dark:text-neutral-200 text-center bg-neutral-50 dark:bg-neutral-700">
                    {utxo.nft_commitment}
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
    <div className="sticky bottom-0 bg-primary-900 w-full border-t-2 border-neutral-900 dark:border-primarydark-500 rounded-t shadow mt-1">
      <div className="text-neutral-700 rounded-t bg-neutral-100 dark:bg-neutral-1000 dark:text-neutral-100 shadow-lg px-2 py-1">
        <div className="flex relative justify-between">
          <div className="flex items-center justify-start flex-1">
            <Button
              onClick={handleCancel}
              icon={CloseOutlined}
              iconSize="lg"
              bgColor="transparent"
              activeBgColor="bg-primary-500 dark:active:bg-primarydark-400"
              borderClasses="border border-primary-400"
            />
          </div>
          <div className="text-center grow flex items-center justify-center font-bold text-xl p-6">
            {selectedAmount} NFTs selected
          </div>
          <div className="flex items-center justify-end flex-1">
            <Button
              icon={SendOutlined}
              iconSize="xl"
              label="Send"
              padding="2"
              rounded="md"
              onClick={handleConfirm}
              bgColor="bg-primary-700"
              activeLabelColor="text-white"
              labelColor="text-neutral-200"
              borderClasses="border border-primary-700"
              inverted
            />
          </div>
        </div>
      </div>
    </div>
  );
}
