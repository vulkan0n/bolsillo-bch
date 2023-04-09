import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
} from "@bitauth/libauth";

import WalletService from "@/services/WalletService";

import { crypto } from "@/util/crypto";
const { secp256k1, ripemd160, sha256, sha512 } = crypto;

function HdNodeService(wallet_id) {
  //console.log("HdNodeService", wallet_id);
  const { mnemonic, derivation } = new WalletService().getWalletById(wallet_id);

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdMaster = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, seed);
  const hdMain = deriveHdPath(crypto, hdMaster, `${derivation}/0/0`);
  const hdChange = deriveHdPath(crypto, hdMaster, `${derivation}/1/0`);

  return {
    generateAddress,
    signTransaction,
  };

  // raw address generation function
  function generateAddress(index, change) {
    const child = deriveHdPrivateNodeChild(
      crypto,
      change ? hdChange : hdMain,
      index
    );

    const pubKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
    const hash = ripemd160.hash(sha256.hash(pubKey));
    const address = encodeCashAddress("bitcoincash", "P2PKH", hash);

    //console.log("generateAddress", index, address);
    return address;
  }

  function signTransaction(tx_hex) {
    return tx_hex;
  }
}

export default HdNodeService;
