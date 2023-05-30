import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImportOutlined } from "@ant-design/icons";

import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

import * as bip39 from "bip39";

export default function SettingsWalletImport() {
  const navigate = useNavigate();
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [message, setMessage] = useState("");

  const handleMnemonicInput = (event) => {
    const sanitizedInput = event.target.value
      .toLowerCase()
      .replace(/[^a-z ]/g, "") // strip all non a-z
      .replace(/ {2,}/g, " "); // strip consecutive spaces

    setMnemonicInput(sanitizedInput);
    setMessage("");
  };

  const handleImportWallet = () => {
    const trimmedInput = mnemonicInput.trim();
    const wordCount = trimmedInput.split(" ").length;
    if (wordCount < 12) {
      setMessage("Recovery phrase must be at least 12 words");
      return;
    }

    const valid = bip39.validateMnemonic(trimmedInput);
    if (valid) {
      try {
        const wallet = new WalletService().importWallet(
          trimmedInput,
          "m/44'/0'/0'"
        );
        navigate(`/settings/wallet/${wallet.id}`, { replace: true });
      } catch (e) {
        setMessage("That wallet has already been imported!");
      }
    }
  };

  return (
    <>
      <div className="text-2xl text-center text-neutral-900">
        Enter your Recovery Phrase
      </div>
      <div className="flex justify-center">
        {message === "" ? (
          <ul className="list-disc p-2 text-left text-neutral-700">
            <li>May also be known as a 'seed phrase'</li>
            <li>Generally 12 or 24 words long</li>
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
        ></textarea>
      </div>
      <div className="my-2">
        <button
          type="button"
          className="bg-primary text-white w-full rounded-lg p-2"
          onClick={handleImportWallet}
        >
          <ImportOutlined className="text-2xl" /> Import Wallet
        </button>
      </div>
    </>
  );
}
