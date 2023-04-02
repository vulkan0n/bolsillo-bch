import DatabaseService from "./DatabaseService.jsx";
import * as bip39 from "bip39";

function WalletService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    boot,
    createWallet,
    getWallets,
    getWalletById,
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
  // TODO: handle no-wallet case better
  async function boot(wallet_id) {
    console.log("booting with wallet", wallet_id);
    const wallets = getWallets();

    if (wallets.length === 0) {
      await createWallet("Selene Default");
    }

    const wallet = getWalletById(wallet_id);
    console.log("boot got", wallet);
    return wallet;
  }

  // ----------------------------

  // generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  async function createWallet(name, derivation = "m/44'/0'/0'") {
    const mnemonic = bip39.generateMnemonic();

    const result = db.run(
      `INSERT INTO wallets (name, mnemonic, derivation) VALUES ("${name}","${mnemonic}","${derivation}") RETURNING *`
    );

    console.log("creating wallet", name, mnemonic, result);

    await saveDatabase();

    return result;
  }

  // ----------------------------
}

export default WalletService;

// otherwise let's register the first GAP_LIMIT addresses in db
/*if (addresses.length === 0) {
      const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit; TODO: move to constants?
      for (let i = 0; i < ADDRESS_GAP_LIMIT / 4; i++) {
        const address = wallet.generateAddress(i);
        wallet.registerAddress(address, i);
      }
      await saveDatabase();
    }*/
