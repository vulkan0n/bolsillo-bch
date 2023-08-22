import * as bip39 from "bip39";
import DatabaseService from "./DatabaseService";
import AddressManagerService from "./AddressManagerService";
import { SELENE_DEFAULT_DERIVATION_PATH } from "../util/crypto";

export default function WalletService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    getWallets,
    getWalletById,
    boot,
    createWallet,
    importWallet,
    deleteWallet,
    updateKeyViewed,
    setWalletName,
    clearWalletData,
  };

  // ----------------------------

  // getWallets: return a list of all wallets in the database
  function getWallets() {
    const result = resultToJson(db.exec("SELECT * FROM wallets"));
    //console.log("getWallets", result);
    return result;
  }

  // getWalletById: get a consumable Wallet object from the database
  function getWalletById(id) {
    const result = resultToJson(
      db.exec(`SELECT * FROM wallets WHERE id="${id}"`)
    );
    //console.log("getWalletById", result);
    return result.length > 0 ? result[0] : null;
  }

  // ----------------------------

  // boot: load a wallet, create a wallet if none exist
  function boot(wallet_id) {
    let wallet = getWalletById(wallet_id);

    if (wallet === null) {
      const wallets = getWallets();

      // if no wallet exists, create one and return it
      if (wallets.length === 0) {
        wallet = createWallet("My Selene Wallet");
      } else {
        // return lowest-index wallet if requested wallet doesn't exist
        wallet = wallets.shift();
      }
    }

    const AddressManager = new AddressManagerService(wallet.id);
    AddressManager.populateAddresses();

    return wallet;
  }

  // ----------------------------

  // createWallet: generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  function createWallet(name, derivation = SELENE_DEFAULT_DERIVATION_PATH) {
    const mnemonic = bip39.generateMnemonic();

    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (name, mnemonic, derivation) VALUES (?, ?, ?) RETURNING *`,
        [name, mnemonic, derivation]
      )
    )[0];

    //console.log("creating wallet", result);
    saveDatabase();
    return result;
  }

  function importWallet(mnemonic, derivation = "m/44'/0'/0'") {
    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (name, mnemonic, derivation, key_viewed) VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ')) RETURNING *`,
        ["Imported Wallet", mnemonic, derivation]
      )
    )[0];

    //console.log("importing wallet", result);
    saveDatabase();
    return result;
  }

  function deleteWallet(wallet_id) {
    clearWalletData(wallet_id);

    db.run(
      `DELETE FROM transactions WHERE txid IN (SELECT txid FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}"))`
    );

    db.run(`DELETE FROM wallets WHERE id="${wallet_id}"`);

    saveDatabase();
  }

  function updateKeyViewed(wallet_id) {
    db.run(
      `UPDATE wallets SET key_viewed=datetime('now') WHERE id=${wallet_id}`
    );

    saveDatabase();
  }

  function setWalletName(wallet_id, name) {
    db.run(`UPDATE wallets SET name=? WHERE id="${wallet_id}"`, [name]);
    saveDatabase();
  }

  function clearWalletData(wallet_id) {
    db.run(
      `DELETE FROM transactions WHERE txid IN (SELECT txid FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}"))`
    );
    db.run(
      `DELETE FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}")`
    );
    db.run(`DELETE FROM addresses WHERE wallet_id="${wallet_id}"`);
    db.run(`DELETE FROM address_utxos WHERE wallet_id="${wallet_id}"`);

    saveDatabase();
  }
}
