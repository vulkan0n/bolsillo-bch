import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ImportOutlined } from "@ant-design/icons";
import * as bip39 from "bip39";
import Accordion from "@/components/atoms/Accordion";
import ElectrumService from "@/services/ElectrumService";
import HdNodeService from "@/services/HdNodeService";

import { selectActiveWallet } from "@/redux/wallet";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/crypto";

export default function WalletViewScanTool() {
  const navigate = useNavigate();

  const wallet = useSelector(selectActiveWallet);

  return (
    <>
      <div>{JSON.stringify(wallet)}</div>
      <div>
        {DERIVATION_PATHS.map((path) => (
          <div>{path}</div>
        ))}
      </div>
    </>
  );
}

function commitAddresses(wallet, addresses) {
  const AddressManager = AddressManagerService(wallet);
  addresses.forEach((addr) => {
    AddressManager.registerAddress(addr);
  });
}

async function scanAddresses(
  wallet,
  path,
  change,
  nScanStart = 0,
  nScanEnd = 20
) {
  // derive addresses without registering them
  const Hd = HdNodeService(wallet);

  const Electrum = ElectrumService();

  const addresses = [];
  for (let hd_index = nScanStart; hd_index < nScanEnd; hd_index += 1) {
    const address = Hd.generateAddress(hd_index, change);
    addresses.push({ address, hd_index, change });
  }

  // request state hashes for each address
  const addressStates = await Promise.all(
    addresses.map(async (address) => ({
      ...address,
      state: await Electrum.requestAddressState(address.address),
    }))
  );

  return addressStates;
}
