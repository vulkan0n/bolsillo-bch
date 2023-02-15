import {
  instantiateSecp256k1,
  instantiateRipemd160,
  instantiateSha256,
  instantiateSha512,
  generatePrivateKey,
  deriveHdPrivateNodeFromSeed,
  deriveHdPrivateNodeChild,
  encodeCashAddress,
} from "@bitauth/libauth";

const secp256k1 = await instantiateSecp256k1();
const ripemd160 = await instantiateRipemd160();
const sha256 = await instantiateSha256();
const sha512 = await instantiateSha512();

const _fakeDb = [
  {
    name: "Selene Default",
    k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
  },
  {
    name: "Selene Test",
    k: "0,139,37,23,41,12,197,140,201,25,78,42,88,40,169,182,200,34,204,193,125,7,99,180,138,12,174,158,128,225,172,61",
  },
];

// WalletService generates wallets and brokers them between the storage layer
// and the rest of the application
function WalletService() {
  // create a new wallet object
  function createWallet(name) {
    const k = generatePrivateKey(() =>
      window.crypto.getRandomValues(new Uint8Array(32))
    );

    const w = secp256k1.validatePrivateKey(k)
      ? {
          name,
          k: k.toString(),
        }
      : null;

    console.log("createWallet", w);
    return w;
  }

  // load a wallet from storage and derive its HD node
  function loadWallet(name) {
    // TODO: get Wallet from Storage
    let result = _fakeDb.find((e) => e.name == name);
    if (!result) {
      result = createWallet(name);
    }

    const hd = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, result.k);
    return result ? { ...result, hd } : null;
  }

  function generateAddress(hd, index) {
    const child = deriveHdPrivateNodeChild(
      {
        ripemd160,
        secp256k1,
        sha256,
        sha512,
      },
      hd,
      index
    );

    const pubKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
    const hash = ripemd160.hash(sha256.hash(pubKey));
    const address = encodeCashAddress("bitcoincash", "P2PKH", hash);

    // TODO: track index:address map in a database
    console.log("generateAddress", address, child);
    return address;
  }

  return {
    createWallet,
    loadWallet,
    generateAddress,
  };
}

export default WalletService;
