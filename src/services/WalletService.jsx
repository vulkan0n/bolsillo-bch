import StorageService from "./StorageService.jsx";

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

// WalletService generates wallets and brokers them between the storage layer
// and the rest of the application
function WalletService() {
  return {
    loadWallet,
  };

  // load a wallet from storage and return a consumable Wallet API
  // create the wallet if it doesn't exist
  function loadWallet(name) {
    const S = new StorageService();

    let key = S.getWalletByName(name);
    if (!key) {
      key = generateWallet();
    }

    // TODO: throw an exception instead of null?
    return key ? Wallet(name, key.toString()) : null;
  }

  // raw wallet (private key) generation function
  function generateWallet() {
    const k = generatePrivateKey(() =>
      window.crypto.getRandomValues(new Uint8Array(32))
    );

    return secp256k1.validatePrivateKey(k) ? k : null;
  }

  function Wallet(name, key) {
    const hd = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, key);

    // raw address generation function
    function generateAddress(index) {
      console.log("generating address", index);
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

      console.log("generateAddress", index, address);
      return address;
    }

    // returns the top 4 lowest-index unused addresses
    function getFreshAddresses() {
      // TODO: scan DB for addresses
      return [...new Array(4).keys()].map((i) => generateAddress(i));
    }

    // returns a list of subscribed addresses from the DB
    function getSubscribedAddresses() {
      // TODO: scan DB for addresses
      return [...new Array(4).keys()].map((i) => generateAddress(i));
    }

    return {
      generateAddress,
      getFreshAddresses,
      getSubscribedAddresses,
    };
  }
}

export default WalletService;
