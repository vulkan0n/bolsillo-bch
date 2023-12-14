import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImportOutlined } from "@ant-design/icons";
import * as bip39 from "bip39";
import Accordion from "@/components/atoms/Accordion";
import WalletManagerService from "@/services/WalletManagerService";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/crypto";

export default function SettingsWalletWizardScan() {
  const [scanStartIndex, setScanStartIndex] = useState(0);
  const [scanEndIndex, setScanEndIndex] = useState(1024);

  const handleStartIndexInput = (event) =>
    setScanStartIndex(event.target.value);
  const handleEndIndexInput = (event) => setScanEndIndex(event.target.value);

  return (
    <>
      <div className="text-2xl text-center text-neutral-900">
        Scanning Addresses
      </div>
    </>
  );
}
