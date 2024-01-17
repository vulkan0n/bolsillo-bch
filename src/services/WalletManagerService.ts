import Logger from "js-logger";
import * as bip39 from "bip39";
import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";
import {
  ValidDerivationPath,
  DEFAULT_DERIVATION_PATH,
  ValidBchNetwork,
} from "@/util/crypto";

export interface WalletEntity {
  id: number;
  name: string;
  mnemonic: string;
  passphrase: string;
  derivation: ValidDerivationPath;
  date_created: string;
  key_viewed: string;
  key_verified: string;
  balance: number;
  prefix: string;
}

export class WalletNotExistsError extends Error {
  constructor(id: number | string) {
    super(`No Wallet with id ${id}`);
  }
}

export default function WalletManagerService() {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    getWallets,
    getWalletById,
    boot,
    createWallet,
    importWallet,
    deleteWallet,
    updateKeyViewed,
    updateKeyVerified,
    setWalletName,
    clearWalletData,
  };

  // ----------------------------

  // getWallets: return a list of all wallets in the database
  function getWallets(): WalletEntity[] {
    const result = resultToJson(db.exec("SELECT * FROM wallets"));
    Logger.debug("getWallets", result);
    return result;
  }

  // getWalletById: get a consumable Wallet object from the database
  function getWalletById(id: number | string = 0): WalletEntity {
    const result = resultToJson(
      db.exec(`SELECT * FROM wallets WHERE id="${id}"`)
    );

    Logger.debug("getWalletById", id, result);

    if (result.length === 0) {
      throw new WalletNotExistsError(id);
    }

    return result[0];
  }

  // ----------------------------

  // boot: load a wallet, create a wallet if none exist
  function boot(wallet_id: number, network: ValidBchNetwork): WalletEntity {
    let wallet: WalletEntity;
    try {
      wallet = getWalletById(wallet_id);
    } catch (e) {
      if (!(e instanceof WalletNotExistsError)) {
        Logger.warn("something bad happened during boot", e);
        throw e;
      }

      // requested wallet doesn't exist
      // attempt to return lowest-index wallet instead, create a new wallet if none exist
      const wallets = getWallets();
      wallet = wallets.shift() || createWallet("My Selene Wallet");
    }

    // for safety, assume testnet unless we've explicitly stated to be on mainnet
    wallet.prefix = network === "mainnet" ? "bitcoincash" : "bchtest";

    Logger.debug("walletBoot", wallet_id, wallet, network);
    return wallet;
  }

  // ----------------------------

  // createWallet: generate a new wallet from a randomly generated seed phrase
  // persist the new wallet in the database
  function createWallet(
    name: string = "New Wallet",
    passphrase: string = "",
    derivation: ValidDerivationPath = DEFAULT_DERIVATION_PATH
  ): WalletEntity {
    const mnemonic = bip39.generateMnemonic();

    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (
          name, 
          mnemonic, 
          passphrase, 
          derivation
        ) VALUES (?, ?, ?, ?) RETURNING *`,
        [name, mnemonic, passphrase, derivation]
      )
    )[0];

    Logger.log("creating wallet", result);
    saveDatabase();
    return result;
  }

  // importWallet: import a wallet via provided seed phrase
  // persist the imported wallet in the database
  function importWallet(
    mnemonic: string,
    passphrase: string = "",
    derivation: ValidDerivationPath = DEFAULT_DERIVATION_PATH
  ): WalletEntity {
    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (
          name, 
          mnemonic, 
          passphrase, 
          derivation, 
          key_viewed
        ) VALUES (
          ?, ?, ?, ?, 
          strftime('%Y-%m-%dT%H:%M:%SZ')
        ) RETURNING *`,
        ["Imported Wallet", mnemonic, passphrase, derivation]
      )
    )[0];

    Logger.log("importing wallet", result);
    saveDatabase();
    return result;
  }

  function deleteWallet(wallet_id: number): void {
    clearWalletData(wallet_id);

    db.run(
      `DELETE FROM transactions WHERE txid IN (SELECT txid FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}"))`
    );

    db.run(`DELETE FROM wallets WHERE id="${wallet_id}"`);

    saveDatabase();
  }

  // updateKeyViewed: updates the wallet's key_viewed timestamp
  function updateKeyViewed(wallet_id: number): string {
    const result = resultToJson(
      db.exec(
        `UPDATE wallets SET key_viewed=strftime('%Y-%m-%dT%H:%M:%SZ') WHERE id='${wallet_id}' RETURNING key_viewed`
      )
    )[0];

    Logger.debug("keyViewed", result);

    saveDatabase();
    return result.key_viewed;
  }

  // updateKeyVerified: updates the wallet's key_verified timestamp
  function updateKeyVerified(wallet_id: number): void {
    db.run(
      `UPDATE wallets SET key_verified=strftime('%Y-%m-%dT%H:%M:%SZ') WHERE id='${wallet_id}'`
    );

    saveDatabase();
  }

  // setWalletName: sets a wallet's display name
  function setWalletName(wallet_id: number, name: string): void {
    db.run(`UPDATE wallets SET name=? WHERE id="${wallet_id}"`, [name]);
    saveDatabase();
  }

  // clearWalletData: deletes all data associated with a wallet
  // does NOT delete the wallet; all data can be re-derived/resynced
  function clearWalletData(wallet_id: number): void {
    // delete this wallet's transaction history
    db.run(
      `DELETE FROM address_transactions WHERE 
        address IN (
          SELECT address FROM addresses WHERE 
            wallet_id="${wallet_id}"
        )`
    );

    // delete wallet addresses
    db.run(`DELETE FROM addresses WHERE wallet_id="${wallet_id}"`);

    // delete wallet utxos
    db.run(`DELETE FROM address_utxos WHERE wallet_id="${wallet_id}"`);

    // reset wallet balance
    db.run(`UPDATE wallets SET balance='0' WHERE id="${wallet_id}"`);

    // purge orphaned transaction data
    TransactionManagerService().purgeTransactions();

    saveDatabase();
  }
}
