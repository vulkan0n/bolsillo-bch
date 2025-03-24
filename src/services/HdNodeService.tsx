import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
  secp256k1,
  ripemd160,
  CashAddressType,
} from "@bitauth/libauth";

import { hexToBin } from "@/util/hex";
import { sha256 } from "@/util/hash";

//import LogService from "@/services/LogService";
import AddressManagerService from "@/services/AddressManagerService";
import WalletManagerService, {
  WalletStub,
} from "@/services/WalletManagerService";

//const Log = LogService("HdNode");

export default function HdNodeService(walletStub: WalletStub) {
  const WalletManager = WalletManagerService();
  const walletHash = WalletManager.calculateWalletHash(walletStub);
  const { mnemonic, derivation, passphrase } = walletStub;

  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);
  const hdMain = deriveHdPath(hdMaster, `${derivation}/0`);
  const hdChange = deriveHdPath(hdMaster, `${derivation}/1`);

  return {
    generateAddress,
    signInputs,
  };

  // raw address generation function
  function generateAddress(index, change = 0) {
    const child = deriveHdPrivateNodeChild(change ? hdChange : hdMain, index);

    const pubKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
    const hash = ripemd160.hash(sha256.hash(pubKey));
    const { address } = encodeCashAddress({
      prefix: WalletManager.getPrefix(),
      type: CashAddressType.p2pkh,
      payload: hash,
      throwErrors: true,
    });

    //Log.debug("generateAddress", index, address);
    return address;
  }

  function _deriveAddressPrivateKey(address) {
    const AddressManager = AddressManagerService(walletHash);
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
      outpointIndex: Number(input.tx_pos), // Can't be BigInt! Being selected as bigint from db.
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
        token:
          input.token_category === null
            ? undefined
            : {
                category: hexToBin(input.token_category),
                amount: input.token_amount,
                nft:
                  input.nft_capability === null
                    ? undefined
                    : {
                        capability: input.nft_capability,
                        commitment: input.nft_commitment,
                      },
              },
      },
    }));
  }
}
