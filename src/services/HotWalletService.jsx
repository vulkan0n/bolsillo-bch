import {
  instantiateSecp256k1,
  instantiateRipemd160,
  instantiateSha256,
  instantiateSha512,
  generatePrivateKey,
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  deriveHdPath,
  encodeCashAddress,
} from "@bitauth/libauth";

const secp256k1 = await instantiateSecp256k1();
const ripemd160 = await instantiateRipemd160();
const sha256 = await instantiateSha256();
const sha512 = await instantiateSha512();

const crypto = {
  ripemd160,
  secp256k1,
  sha256,
  sha512,
};

function HotWalletService(wallet) {
  console.log("HotWalletService", wallet);
  const seed = bip39.mnemonicToSeedSync(wallet.mnemonic);
  const hdMaster = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, seed);
  const hdMain = deriveHdPath(crypto, hdMaster, `${wallet.derivation}/0/0`);
  const hdChange = deriveHdPath(crypto, hdMaster, `${wallet.derivation}/1/0`);

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
