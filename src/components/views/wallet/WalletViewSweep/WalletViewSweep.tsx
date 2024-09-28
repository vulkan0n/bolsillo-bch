import Logger from "js-logger";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";

import { selectActiveWallet } from "@/redux/wallet";

import { selectKeyboardIsOpen } from "@/redux/device";
import { selectSyncState } from "@/redux/sync";

import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";
import TransactionManagerService from "@/services/TransactionManagerService";
import ToastService from "@/services/ToastService";

import Satoshi from "@/atoms/Satoshi";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";
import CurrencyFlip from "@/atoms/CurrencyFlip";

import { translate } from "@/util/translations";
import {
  type ElectrumUtxo,
  buildSweepTransaction,
  validateWifString,
} from "@/util/sweep";
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

  if (!params.wif) {
    throw new Error('No "wif" param specified in route');
  }

  const {
    address: wifAddress,
    privateKey,
    wif,
  } = validateWifString(params.wif);

  // Throw an error if the WIF is invalid.
  if (!wifAddress) {
    throw new Error(`Invalid WIF provided (${params.wif})`);
  }

  useEffect(() => {
    const requestUtxos = async () => {
      // Fetch the UTXOs from our Electrum Service.
      const electrumUtxos = await ElectrumService().requestUtxos(wifAddress);

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

  const wifSatoshiBalance = useMemo(() => {
    return utxos.reduce((total, utxo) => total + utxo.value, 0);
  }, [utxos]);

  const didWifContainTokens = useMemo(() => {
    return utxos.some((utxo) => utxo.token_data);
  }, [utxos]);

  // Set message based on WIF state (empty or contains tokens).
  useEffect(() => {
    if (isFetchingUtxos) {
      setMessage("");
    }

    // If the WIF is empty...
    else if (!wifSatoshiBalance) {
      const emptyWifTranslation = translate(translations.emptyWif);
      setMessage(emptyWifTranslation);
    }

    // If the WIF contains tokens...
    // NOTE: We check for this condition because Selene does not yet support tokens (and nor does the sweep tx builder).
    //       If a WIF contains tokens, chances are it's deliberate. And if we try to sweep a WIF with tokens, we would implicitly burn them.
    else if (didWifContainTokens) {
      const wifContainsTokensTranslation = translate(
        translations.wifContainsTokens
      );
      setMessage(wifContainsTokensTranslation);
    } else {
      setMessage("");
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
      await Haptics.notification({ type: NotificationType.Success });

      // Navigate to the "Sweep Successful" page.
      navigate("/wallet/sweep/success", {
        state: { tx },
        replace: true,
      });
    } catch (error) {
      Logger.warn(`Sweeping from ${wif} failed: ${error}`);
      setMessage(`Sweeping failed: ${error}`);
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
