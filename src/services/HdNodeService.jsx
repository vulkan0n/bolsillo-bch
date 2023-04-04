import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
} from "@bitauth/libauth";

import { crypto } from "@/util/crypto";
const { secp256k1, ripemd160, sha256, sha512 } = crypto;

function HdNodeService(mnemonic, derivation = "m/44'/0'/0'") {
  console.log("HdNodeService", wallet);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdMaster = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, seed);
  const hdMain = deriveHdPath(crypto, hdMaster, `${derivation}/0/0`);
  const hdChange = deriveHdPath(crypto, hdMaster, `${derivation}/1/0`);

  return {
    generateAddress,
    sendToAddress,
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

    return address;
  }

  // cope and seethe
  function sendToAddress(address, satoshis) {
    console.log("sending transaction...", satoshis, address);
  }
}
