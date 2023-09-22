import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
  secp256k1,
  ripemd160,
  sha256,
} from "@bitauth/libauth";

import { hexToBin } from "@/util/hex";

import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";

export default function HdNodeService(wallet_id) {
  const { mnemonic, derivation, passphrase } =
    new WalletService().getWalletById(wallet_id);
  //console.log("HdNodeService", wallet_id, derivation, mnemonic);

  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);
  const hdMain = deriveHdPath(hdMaster, `${derivation}/0`);
  const hdChange = deriveHdPath(hdMaster, `${derivation}/1`);

  return {
    generateAddress,
    signInputs,
  };

  // raw address generation function
  function generateAddress(index, change) {
    const child = deriveHdPrivateNodeChild(change ? hdChange : hdMain, index);

    const pubKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
    const hash = ripemd160.hash(sha256.hash(pubKey));
    const address = encodeCashAddress("bitcoincash", "P2PKH", hash);

    //console.log("generateAddress", index, address);
    return address;
  }

  function _deriveAddressPrivateKey(address) {
    const AddressManager = new AddressManagerService(wallet_id);
    const { hd_index, change } = AddressManager.getAddress(address);

    const { privateKey } = deriveHdPrivateNodeChild(
      change ? hdChange : hdMain,
      hd_index
    );

    return privateKey;
  }

  function signInputs(inputs, compiler) {
    return inputs.map((input) => ({
      outpointTransactionHash: hexToBin(input.txid),
      outpointIndex: input.tx_pos,
      sequenceNumber: 0,
      unlockingBytecode: {
        compiler,
        script: "unlock",
        valueSatoshis: BigInt(input.amount),
        data: {
          keys: {
            privateKeys: {
              key: _deriveAddressPrivateKey(input.address),
            },
          },
        },
      },
    }));
  }
}
