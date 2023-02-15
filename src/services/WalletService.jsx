import {
  instantiateSecp256k1,
  instantiateSha512,
  generatePrivateKey,
  deriveHdPrivateNodeFromSeed,
} from "@bitauth/libauth";

// WalletService generates wallets and brokers them between the storage layer
// and the rest of the application
function WalletService() {
  // create a new wallet object
  async function createWallet(name) {
    const secp256k1 = await instantiateSecp256k1();

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
  async function loadWallet(name) {
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

    const result = _fakeDb.find((e) => e.name == name);
    if (!result) {
      return null;
    }

    const sha512 = await instantiateSha512();
    const hd = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, result.k);

    return result ? { ...result, hd } : null;
  }

  return {
    createWallet,
    loadWallet,
  };
}

export default WalletService;
