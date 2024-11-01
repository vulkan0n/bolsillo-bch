import Logger from "js-logger";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";

import { selectKeyboardIsOpen } from "@/redux/device";
import { selectSyncState } from "@/redux/sync";

import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";
import TransactionManagerService from "@/services/TransactionManagerService";
import {
  type ElectrumUtxo,
  buildSweepTransaction,
} from "@/services/TransactionBuilderService";
import ToastService from "@/services/ToastService";

import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import { validateWifUri } from "@/util/uri";
import { Haptic } from "@/util/haptic";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function WalletViewSweep() {
  const params = useParams();
  const navigate = useNavigate();

  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const buttonsPos = isKeyboardOpen ? "bottom-2" : "bottom-[5em]";

  const wallet = useSelector(selectActiveWallet);
  const sync = useSelector(selectSyncState);

  // Reload unused addresses when wallet data changes
  const unusedAddresses = useMemo(
    () => AddressManagerService(wallet).getUnusedAddresses(),
    [wallet]
  );

  // Get the receiving address to use.
  const receivingAddress = useMemo(() => {
    return unusedAddresses[0]?.address || "";
  }, [unusedAddresses]);

  // Set our state.
  const [isFetchingUtxos, setIsFetchingUtxos] = useState(true);
  const [isSweeping, setIsSweeping] = useState(false);
  const [message, setMessage] = useState("");
  const [utxos, setUtxos] = useState<Array<ElectrumUtxo>>([]);
  const [isSweepable, setIsSweepable] = useState(false);

  // Throw an error if no WIF was provided as a URL param to this route.
  if (!params.wif) {
    throw new Error('No "wif" param specified in route');
  }

  // Validate the WIF provided is valid.
  const { address: wifAddress, privateKey, wif } = validateWifUri(params.wif);

  // Throw an error if the WIF is invalid.
  if (!wifAddress) {
    throw new Error(`Invalid WIF provided (${params.wif})`);
  }

  // Run when Electrum's connectivity state changes.
  // NOTE: This is to prevent a race-condition whereby a user can land on this page prior to Electrum being connected.
  //       The intent is to allow Selene to be invoked by a "bch-wif:${wif}" URL and "wait" for connection before making the requestUTXO's call.
  useEffect(() => {
    const requestUtxos = async () => {
      // Fetch the UTXOs from our Electrum Service.
      const electrumUtxos = await ElectrumService().requestUtxos(wifAddress);

      // Check if the response is an instance of Error (because Electrum Requests do not "throw" errors, they return them).
      if (utxos instanceof Error) {
        throw utxos;
      }

      // Set the UTXOs.
      setUtxos(electrumUtxos as Array<ElectrumUtxo>);
      setIsFetchingUtxos(false);
    };

    if (sync.isConnected && isFetchingUtxos) {
      requestUtxos();
    }
  }, [sync.isConnected, isFetchingUtxos, utxos, wifAddress]);

  // Calculate the satoshi balance when our UTXOs change.
  const wifSatoshiBalance = useMemo(() => {
    return utxos.reduce((total, utxo) => total + utxo.value, 0);
  }, [utxos]);

  // Determine whether the WIF contains tokens so that we can display an unsupported message.
  // NOTE: This will not be functional until our Electrum Protocol uses >= V1.5.
  //       For Electrum Protocol < V1.5 UTXOs containing tokens will just be ignored (not swept).
  const didWifContainTokens = useMemo(() => {
    return utxos.some((utxo) => utxo.token_data);
  }, [utxos]);

  // Set message based on WIF state (empty or contains tokens).
  useEffect(() => {
    if (isFetchingUtxos) {
      setMessage("");
    }

    // If the WIF is empty, set the wallet to unsweepable and show a message.
    else if (!wifSatoshiBalance) {
      const emptyWifTranslation = translate(translations.emptyWif);
      setMessage(emptyWifTranslation);
      setIsSweepable(false);
    }

    // If the WIF contains tokens, set the wallet to unsweepable and show a message.
    else if (didWifContainTokens) {
      const wifContainsTokensTranslation = translate(
        translations.wifContainsTokens
      );
      setMessage(wifContainsTokensTranslation);
      setIsSweepable(false);
    } else {
      setMessage("");
      setIsSweepable(true);
    }
  }, [isFetchingUtxos, wifSatoshiBalance, didWifContainTokens]);

  const confirmSweep = async () => {
    if (isSweeping) {
      return;
    }

    setIsSweeping(true);

    if (!sync.isConnected) {
      ToastService().disconnected();
      setIsSweeping(false);
      return;
    }

    try {
      // Get instances of TransactionManager.
      const TransactionManager = TransactionManagerService();

      // Build the transaction to sweep the WIF.
      const transaction = buildSweepTransaction(
        utxos,
        privateKey,
        receivingAddress
      );

      // Broadcast the transaction.
      await TransactionManager.sendTransaction(transaction, wallet);

      // Wait for the transaction to resolve.
      const tx = await TransactionManager.resolveTransaction(transaction.txid);

      // Show a notification.
      await Haptic.success();

      // Navigate to the "Sweep Successful" page.
      navigate("/wallet/send/success", {
        state: { tx, header: translate(translations.walletSwept) },
        replace: true,
      });
    } catch (error) {
      await Haptic.error();
      Logger.warn(`Sweeping from ${wif} failed: ${error}`);
      setMessage(translate(translations.sweepingFailed));
    } finally {
      setIsSweeping(false);
    }
  };

  return (
    <>
      <div className="tracking-wide text-center text-white">
        {message === "" ? (
          <div className="bg-primary p-2">
            <div className="text-xl font-bold">
              {translate(translations.sweepingFrom)}
            </div>
            <div className="text-sm py-1 font-mono tracking-tight">
              <div>{wif}</div>
              (<Address address={wifAddress} />)
            </div>
          </div>
        ) : (
          <div className="bg-error p-2">
            <div className="text-2xl font-bold">{message}</div>
          </div>
        )}
      </div>

      {isFetchingUtxos || isSweeping ? (
        <div className="p-2 flex items-center justify-center fixed top-1/3 w-full text-center">
          <SyncOutlined className="text-7xl" spin />
        </div>
      ) : (
        <>
          <div className="p-2 fixed top-[40%] w-full">
            <div className="py-4 px-2 rounded-md shadow-md bg-primary/95 text-white">
              <div className="flex items-center justify-center">
                <Satoshi value={wifSatoshiBalance} flip />
                <CurrencyFlip className="text-3xl ml-2" />
              </div>
            </div>
          </div>

          <div
            className={`flex absolute ${buttonsPos} w-full justify-around items-center px-2 gap-x-2`}
          >
            {isSweepable === true ? (
              <>
                <div className="mx-2">
                  <Button onClick={() => navigate(-1)} icon={BackIcon} />
                </div>
                <div className="flex-1">
                  <Button
                    size="full"
                    icon={ConfirmIcon}
                    shittyFullWidthHack
                    onClick={() => confirmSweep()}
                    inverted
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <Button
                  size="full"
                  onClick={() => navigate(-1)}
                  icon={BackIcon}
                  shittyFullWidthHack
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ConfirmIcon() {
  return <span className="font-bold">{translate(translations.confirm)}</span>;
}

function BackIcon() {
  return (
    <span>
      <ArrowLeftOutlined className="mr-1" />
      {translate(translations.back)}
    </span>
  );
}
