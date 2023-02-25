import DatabaseService from "./DatabaseService.jsx";

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

import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

import * as bip39 from "bip39";

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

const electrum = new ElectrumClient(
  "Selene.cash",
  "1.4",
  "cashnode.bch.ninja",
  ElectrumTransport.WSS.Port,
  ElectrumTransport.WSS.Scheme
);

// TODO: what happens if connection fails?
try {
  await electrum.connect();
} catch (e) {
  console.error(e);
}

function WalletService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    boot,
    createWallet,
    getWallets,
    getWalletById,
  };

  async function boot(wallet_id) {
    const wallets = getWallets();

    if (wallets.length === 0) {
      await createWallet("Selene Default");
    }

    console.log("booting with wallet", wallet_id);
    const wallet = getWalletById(wallet_id);

    console.log("boot got", wallet);
    return wallet;
  }

  async function createWallet(name, derivation = "m/44'/0'/0'") {
    const mnemonic = bip39.generateMnemonic();

    const result = db.run(
      `INSERT INTO wallets (name, mnemonic, derivation) VALUES ("${name}","${mnemonic}","${derivation}") RETURNING *`
    );

    console.log("creating wallet", name, mnemonic, result);

    await saveDatabase();
  }

  function getWallets() {
    const result = resultToJson(db.exec("SELECT * FROM wallets"));
    //console.log("getWallets", result);
    return result;
  }

  function getWalletById(id) {
    const result = resultToJson(
      db.exec(`SELECT * FROM wallets WHERE id='${id}'`)
    );
    //console.log("getWalletById", result);
    return result.length > 0 ? Wallet(result[0]) : null;
  }

  async function requestBalance(address) {
    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    const total = confirmed + unconfirmed;

    db.run(
      `UPDATE addresses SET balance="${total}
      }" WHERE address="${address}"`
    );

    return total;
  }

  async function handleBalanceUpdate(update) {
    if (!Array.isArray(update)) return;

    const address = update[0];
    const balance = await requestBalance(address);
  }

  function Wallet(wallet) {
    console.log("Wallet", wallet);
    const seed = bip39.mnemonicToSeedSync(wallet.mnemonic);
    const hdMaster = deriveHdPrivateNodeFromSeed({ sha512: sha512 }, seed);
    const hdMain = deriveHdPath(crypto, hdMaster, `${wallet.derivation}/0/0`);
    const hdChange = deriveHdPath(crypto, hdMaster, `${wallet.derivation}/1/0`);

    console.log({ hdMaster, hdMain, hdChange }, `${wallet.derivation}/0/0`);

    return {
      generateAddress,
      registerAddress,
      getUnusedAddress,
      getReceiveAddresses,
      getChangeAddresses,
      getBalance,
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

    function getUnusedAddress(skip) {
      const result = resultToJson(
        db.exec(
          `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet.id} AND ntxin < 1 AND ntxout < 1 AND change='0' ORDER BY hd_index DESC LIMIT 1`
        )
      );

      console.log("getUnusedAddress", getUnusedAddress);
    }

    function getChangeAddresses() {
      const result = resultToJson(
        db.exec(
          `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet.id} AND change='1' ORDER BY hd_index DESC`
        )
      );

      console.log("getChangeAddresses", getChangeAddresses);
    }

    function getReceiveAddresses() {
      const result = resultToJson(
        db.exec(
          `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet.id} AND change='0' ORDER BY hd_index DESC`
        )
      );

      console.log("getReceiveAddresses", getReceiveAddresses);
    }

    function registerAddress(address, index) {
      electrum.subscribe(
        handleBalanceUpdate,
        "blockchain.address.subscribe",
        address
      );

      db.run(
        `INSERT INTO addresses (address, wallet_id, hd_index) VALUES ("${address}", "${wallet.id}", "${index}")`
      );
    }

    function getBalance(address) {
      return resultToJson(
        db.exec(`SELECT balance FROM addresses WHERE address="${address}"`)
      );
    }
  }
}

export default WalletService;
