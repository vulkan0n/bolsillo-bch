import Logger from "js-logger";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { SyncOutlined } from "@ant-design/icons";

import { selectBchNetwork } from "@/redux/preferences";

import ViewHeader from "@/layout/ViewHeader";

import ElectrumService from "@/services/ElectrumService";
import WalletManagerService from "@/services/WalletManagerService";
import HdNodeService from "@/services/HdNodeService";
import AddressManagerService from "@/services/AddressManagerService";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/crypto";

export default function SettingsWalletScanTool() {
  const { wallet_id } = useParams();
  const bchNetwork = useSelector(selectBchNetwork);

  const WalletManager = WalletManagerService(bchNetwork);
  const wallet = WalletManager.getWalletById(wallet_id);

  Logger.debug("scan tool", wallet);

  const AddressManager = AddressManagerService(wallet);

  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();
  const unusedReceiveAddresses = AddressManager.getUnusedAddresses(0);
  const unusedChangeAddresses = AddressManager.getUnusedAddresses(0, 1);

  Logger.debug(
    receiveAddresses,
    changeAddresses,
    unusedReceiveAddresses,
    unusedChangeAddresses
  );

  Logger.debug(AddressManager.getReceiveAddresses());

  return (
    <>
      <ViewHeader icon={SyncOutlined} title="Wallet Scan Tool" />
      <div className="p-1">
        <ul>
          <li>Receive Addresses: {receiveAddresses.length}</li>
          <li>
            Used Receive Addresses:{" "}
            {receiveAddresses.length - unusedReceiveAddresses.length}
          </li>
          <li>Unused Receive Addresses: {unusedReceiveAddresses.length}</li>
        </ul>
        <ul>
          <li>Change Addresses: {changeAddresses.length}</li>
          <li>
            Used Change Addresses:{" "}
            {changeAddresses.length - unusedChangeAddresses.length}
          </li>
          <li>Unused Change Addresses: {unusedChangeAddresses.length}</li>
        </ul>
      </div>
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
