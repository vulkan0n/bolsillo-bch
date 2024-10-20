import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ImportOutlined } from "@ant-design/icons";
import * as bip39 from "bip39";
import Accordion from "@/components/atoms/Accordion";
import DatabaseService from "@/services/DatabaseService";
import WalletManagerService from "@/services/WalletManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import LogService from "@/services/LogService";
import { selectBchNetwork } from "@/redux/preferences";
import { translate } from "@/util/translations";
import translations from "./translations";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/crypto";

const Log = LogService("WizardImport");

export default function SettingsWalletWizardImport() {
  const navigate = useNavigate();

  const bchNetwork = useSelector(selectBchNetwork);

  const [mnemonicInput, setMnemonicInput] = useState("");
  const [passphraseInput, setPassphraseInput] = useState("");
  const [walletNameInput, setWalletNameInput] = useState("Imported Wallet");
  const [message, setMessage] = useState("");
  const [derivationPath, setDerivationPath] = useState("auto");

  const handleMnemonicInput = (event) => {
    const sanitizedInput = event.target.value
      .toLowerCase()
      .replace(/[^a-z ]/g, "") // strip all non a-z
      .replace(/ {2,}/g, " "); // strip consecutive spaces

    setMnemonicInput(sanitizedInput);
    setMessage("");
  };

  const handleWalletNameInput = (event) => {
    setWalletNameInput(event.target.value);
  };

  const handlePassphraseInput = (event) => {
    setPassphraseInput(event.target.value);
  };

  const handleDerivationSelect = (event) => {
    setDerivationPath(event.target.value);
  };

  const handleImportWallet = async () => {
    const trimmedInput = mnemonicInput.trim();
    const wordCount = trimmedInput.split(" ").length;
    if (wordCount !== 12 && wordCount !== 24) {
      setMessage(translate(translations.exactWordCount));
      return;
    }

    const isValidMnemonic = bip39.validateMnemonic(trimmedInput);

    if (isValidMnemonic) {
      try {
        const tempWallet = {
          mnemonic: trimmedInput,
          passphrase: passphraseInput,
          derivation: DEFAULT_DERIVATION_PATH,
          prefix: bchNetwork === "mainnet" ? "bitcoincash" : "bchtest",
        };

        const path =
          derivationPath === "auto"
            ? await AddressScannerService(tempWallet).scanDerivationPaths()
            : derivationPath;

        Log.debug("Found path", path);

        const walletData = {
          mnemonic: trimmedInput,
          passphrase: passphraseInput,
          derivation: path,
          name: walletNameInput,
        };

        const WalletManager = WalletManagerService();
        const Database = DatabaseService();
        const walletHash = WalletManager.calculateWalletHash(walletData);
        await Database.openWalletDatabase(walletHash, bchNetwork);
        Database.setKeepAlive(walletHash);
        WalletManagerService().importWallet(walletData);

        navigate(`build/${walletHash}`);
      } catch (e) {
        setMessage(translate(translations.alreadyImported));
      }
    } else {
      setMessage(translate(translations.phraseInvalid));
    }
  };

  return (
    <>
      <div className="text-2xl text-center text-neutral-900">
        {translate(translations.enterRecoveryPhrase)}
      </div>
      <div className="flex justify-center">
        {message === "" ? (
          <ul className="list-disc list-inside p-2 text-left text-neutral-700">
            <li>{translate(translations.alsoKnownAs)}</li>
            <li>{translate(translations.exactly12Or24)}</li>
          </ul>
        ) : (
          <div className="text-error p-2">{message}</div>
        )}
      </div>
      <div className="rounded-md border-4 border-primary">
        <textarea
          className="w-full text-mono h-36 max-h-36 resize-none"
          onChange={handleMnemonicInput}
          value={mnemonicInput}
          autoComplete="off"
        />
      </div>
      <div className="my-1">
        <label>
          <span className="font-bold">Wallet Name</span>
          <input
            type="text"
            className="w-full border border-primary border-2 rounded-sm p-1"
            onChange={handleWalletNameInput}
            value={walletNameInput}
          />
        </label>
      </div>
      <div className="my-1">
        <Accordion icon={() => null} title="Additional Options">
          <Accordion.Child icon={() => null} label="Passphrase">
            <input
              type="text"
              className="w-full border border-primary"
              onChange={handlePassphraseInput}
              value={passphraseInput}
              autoComplete="off"
            />
          </Accordion.Child>
          <Accordion.Child icon={() => null} label="Derivation Path">
            <select onChange={handleDerivationSelect} value={derivationPath}>
              <option value="auto">Auto</option>
              {DERIVATION_PATHS.map((path) => (
                <option value={path}>{path}</option>
              ))}
            </select>
          </Accordion.Child>
        </Accordion>
      </div>
      <div className="my-2">
        <button
          type="button"
          className="bg-primary text-white w-full rounded-lg p-2"
          onClick={handleImportWallet}
        >
          <ImportOutlined className="text-2xl" />{" "}
          {translate(translations.importWallet)}
        </button>
      </div>
    </>
  );
}
