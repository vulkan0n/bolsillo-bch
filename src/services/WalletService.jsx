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

// TODO: allow user to select electrum server(s)
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
    cleanup,
    createWallet,
    getWallets,
    getWalletById,
  };

  // ----------------------------

  // called by useWallet hook to load in user's active wallet
  async function boot(wallet_id) {
    const wallets = getWallets();

    if (wallets.length === 0) {
      await createWallet("Selene Default");
    }

    console.log("booting with wallet", wallet_id);
    const wallet = getWalletById(wallet_id);
    console.log("boot got", wallet);

    // now let's see if we're already watching some addresses
    // otherwise let's register the first GAP_LIMIT addresses in db
    const addresses = wallet.getReceiveAddresses();

    if (addresses.length === 0) {
      const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit
      for (let i = 0; i < ADDRESS_GAP_LIMIT / 4; i++) {
        const address = wallet.generateAddress(i);
        wallet.registerAddress(address, i);
      }
      await saveDatabase();
    } else {
      addresses.forEach((address) => subscribeToAddress(address));
    }

    return wallet;
  }

  // called by useWallet hook to cleanup electrum subscriptions
  async function cleanup(wallet_id) {
    const addresses = getWalletById(wallet_id).getReceiveAddresses();
    addresses.forEach((address) =>
      electrum.unsubscribe(
        handleBalanceUpdate,
        "blockchain.address.subscribe",
        address
      )
    );
  }

  // ----------------------------

  // generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  // return consumable Wallet object
  async function createWallet(name, derivation = "m/44'/0'/0'") {
    const mnemonic = bip39.generateMnemonic();

    const result = db.run(
      `INSERT INTO wallets (name, mnemonic, derivation) VALUES ("${name}","${mnemonic}","${derivation}") RETURNING *`
    );

    console.log("creating wallet", name, mnemonic, result);

    await saveDatabase();
  }

  // ----------------------------

  // return a list of all wallets in the database
  function getWallets() {
    const result = resultToJson(db.exec("SELECT * FROM wallets"));
    //console.log("getWallets", result);
    return result;
  }

  // get a consumable Wallet object from the database
  function getWalletById(id) {
    const result = resultToJson(
      db.exec(`SELECT * FROM wallets WHERE id='${id}'`)
    );
    //console.log("getWalletById", result);
    return result.length > 0 ? Wallet(result[0]) : null;
  }

  // ----------------------------

  // demand the most up-to-date balance information for an address
  // persist this information to the database
  async function requestBalance(address) {
    const { confirmed, unconfirmed } = await electrum.request(
      "blockchain.address.get_balance",
      address
    );

    const addressBalance = confirmed + unconfirmed;

    db.run(
      `UPDATE addresses SET balance="${addressBalance}" WHERE address="${address}"`
    );

    const wallet_id = resultToJson(
      db.exec(`SELECT wallet_id FROM addresses WHERE address="${address}"`)
    )[0].wallet_id;

    const walletBalance = resultToJson(
      db.exec(
        `UPDATE wallets SET balance=(SELECT SUM(balance) FROM addresses WHERE wallet_id="${wallet_id}") RETURNING balance`
      )
    )[0].balance;

    console.log("requestBalance", address, addressBalance, walletBalance);
    await saveDatabase();

    return walletBalance;
  }

  // handler function for updates received from electrum subscription
  async function handleBalanceUpdate(update) {
    if (!Array.isArray(update)) return;

    console.log("handleHideBalance", update);
    const address = update[0];
    const balance = await requestBalance(address);

    document.dispatchEvent(
      new CustomEvent("balanceUpdate", { detail: balance })
    );
  }

  // listen for balance updates from electrum for an address
  function subscribeToAddress(address) {
    console.log("subscribeToAddress", address);

    electrum.subscribe(
      handleBalanceUpdate,
      "blockchain.address.subscribe",
      address
    );
  }

  // ----------------------------

  // publicly-consumable Wallet API
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
      getWalletBalance,
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

    // get the lowest-index unused receive address for this wallet
    function getUnusedAddress(limit = 1) {
      const result = resultToJson(
        db.exec(
          `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet.id} AND ntxin < 1 AND ntxout < 1 AND change='0' ORDER BY hd_index ASC LIMIT ${limit}`
        )
      );

      console.log("getUnusedAddress", result);
    }

    // get all active receive addresses for this wallet
    function getReceiveAddresses() {
      const result = resultToJson(
        db.exec(
          `SELECT address FROM addresses WHERE wallet_id="${wallet.id}" ORDER BY hd_index`
        )
      ).reduce((acc, cur) => [...acc, cur.address], []);

      console.log("getReceiveAddresses", result);
      return result;
    }

    // get all active change addresses for this wallet
    function getChangeAddresses() {
      const result = resultToJson(
        db.exec(
          `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet.id} AND change='1' ORDER BY hd_index`
        )
      );

      console.log("getChangeAddresses", result);
    }

    // register an address into the database and subscribe to it via electrum
    function registerAddress(address, index) {
      console.log("registerAddress", address, index);

      db.run(
        `INSERT INTO addresses (address, wallet_id, hd_index) VALUES ("${address}", "${wallet.id}", "${index}")`
      );

      subscribeToAddress(address);
    }

    // get the wallet's current balance from the database
    function getWalletBalance() {
      return resultToJson(
        db.exec(`SELECT balance FROM wallets WHERE id="${wallet.id}"`)
      )[0].balance;
    }
  }
}

export default WalletService;
