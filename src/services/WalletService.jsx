import DatabaseService from "./DatabaseService";
import AddressManagerService from "./AddressManagerService";
import * as bip39 from "bip39";

function WalletService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    getWallets,
    getWalletById,
    boot,
    createWallet,
  };

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
    return result.length > 0 ? result[0] : null;
  }

  // ----------------------------

  // load a wallet, create a wallet if none exist
  function boot(wallet_id) {
    let wallet = getWalletById(wallet_id);

    if (wallet === null) {
      const wallets = getWallets();

      // if no wallet exists, create one and return it
      if (wallets.length === 0) {
        wallet = createWallet("Selene Default");
      } else {
        // return lowest-index wallet if requested wallet doesn't exist
        wallet = wallets[0];
      }
    }

    const addressManager = new AddressManagerService(wallet_id);
    addressManager.populateAddresses();

    return wallet;
  }

  // ----------------------------

  // generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  function createWallet(name, derivation = "m/44'/0'/0'") {
    const mnemonic = bip39.generateMnemonic();

    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (name, mnemonic, derivation) VALUES ("${name}","${mnemonic}","${derivation}") RETURNING *`
      )
    )[0];

    console.log("creating wallet", result);
    saveDatabase();
    return result;
  }
}

export default WalletService;

/*
 */
