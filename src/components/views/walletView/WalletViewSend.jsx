import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";

import { useSelector, useDispatch } from "react-redux";
import { selectScannerIsScanning, setScannerIsScanning } from "@/redux/device";

import { ReconciliationOutlined, QrcodeOutlined } from "@ant-design/icons";

import { validateInvoiceString } from "@/util/invoice";

import ScannerButton from "./ScannerButton";
import TransactionHistory from "./TransactionHistory";

import { translate, translations } from "@/util/translations";
import { selectPreferences } from "@/redux/preferences";
const { enterBchAddress } = translations.views.walletView.WalletViewSend;

export default function WalletViewSend() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  const isScanning = useSelector(selectScannerIsScanning);

  const [sendAddress, setSendAddress] = useState("");

  function forwardOnValidAddress(input) {
    // go to send screen when valid address is entered
    const { isValid, address, query } = validateInvoiceString(input);

    // decoder function returns object on success, string on error
    if (isValid) {
      navigate(`/wallet/send/${address}${query}`);
    }

    return isValid;
  }

  const handleSendAddressChange = (e) => {
    const input = e.target.value;
    setSendAddress(input);
    forwardOnValidAddress(input);
  };

  const pasteAddressFromClipboard = async () => {
    const paste = (await Clipboard.read()).value;
    const valid = forwardOnValidAddress(paste);

    if (!valid) {
      // TODO: toast that we can't paste here
      setSendAddress(paste);
    }
  };

  // TODO: Scan QR Code from saved image
  return isScanning ? (
    <ScannerButton />
  ) : (
    <div>
      <div className="flex items-center bg-primary">
        <button
          type="button"
          className="text-white p-2"
          onClick={() => dispatch(setScannerIsScanning(true))}
        >
          <QrcodeOutlined className="text-3xl" />
        </button>
        <div className="flex-1 mr-1 py-1">
          <div className="flex">
            <input
              type="text"
              placeholder={translate(enterBchAddress, preferencesLanguageCode)}
              value={sendAddress}
              onChange={handleSendAddressChange}
              className="p-2 flex-1 rounded-l-lg outline-none bg-white text-error focus:text-secondary focus:bg-zinc-50"
            />
            <div
              className="rounded-r-md bg-zinc-100 p-2 cursor-pointer"
              onClick={pasteAddressFromClipboard}
            >
              <ReconciliationOutlined className="text-2xl text-zinc-600 opacity-80" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-2">
        <TransactionHistory />
      </div>
    </div>
  );
}
