import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import * as bip39 from "bip39";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";
import {
  ValidDerivationPath,
  DEFAULT_DERIVATION_PATH,
  ValidBchNetwork,
} from "@/util/crypto";
import { sha256 } from "@/util/hash";

const Log = LogService("WalletManager");

export interface WalletStub {
  mnemonic: string;
  passphrase: string;
  derivation: ValidDerivationPath;
}

export interface WalletEntity extends WalletStub {
  id: number;
  name: string;
  date_created: string;
  key_viewed: string;
  key_verified: string;
  balance: number;
  prefix: string;
  network: ValidBchNetwork;
  walletHash: string;
  nonce: number;
}

export class WalletNotExistsError extends Error {
  constructor(id: number | string) {
    super(`No Wallet with id ${id}`);
  }
}

export default function WalletManagerService(network: ValidBchNetwork) {
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
    exportWalletFile,
    importWalletFile,
  };

  // ----------------------------

  // getWallets: return a list of all wallets in the database
  function getWallets(): WalletEntity[] {
    const result = resultToJson(db.exec("SELECT * FROM wallets"));
    //Log.debug("getWallets", result);
    return result;
  }

  // getWalletById: get a consumable Wallet object from the database
  function getWalletById(id: number | string = 0): WalletEntity {
    const result = resultToJson(
      db.exec(`SELECT * FROM wallets WHERE id="${id}"`)
    );

    //Log.debug("getWalletById", id, result);

    if (result.length === 0) {
      throw new WalletNotExistsError(id);
    }
    const wallet = result[0];

    wallet.network = network;

    // for safety, assume testnet unless we've explicitly stated to be on mainnet
    wallet.prefix = network === "mainnet" ? "bitcoincash" : "bchtest";

    wallet.nonce = 0;

    return wallet;
  }

  // ----------------------------

  // boot: load a wallet, create a wallet if none exist
  async function boot(wallet_id: number): Promise<WalletEntity> {
    let wallet: WalletEntity;
    try {
      Log.debug("walletBoot ~", wallet_id);
      wallet = getWalletById(wallet_id);
    } catch (e) {
      if (!(e instanceof WalletNotExistsError)) {
        Log.warn("critical error during walletBoot!", e);
        throw e;
      }

      // requested wallet doesn't exist
      // attempt to return lowest-index wallet instead, create a new wallet if none exist
      const wallets = getWallets();
      wallet = wallets.shift() || createWallet("My Selene Wallet");
      return boot(wallet.id);
    }

    wallet = await cleanupWallet(wallet);
    Log.debug("walletBoot", wallet_id, wallet, network);
    return wallet;
  }

  // cleanupWallet: ensure wallet correctness before loading
  async function cleanupWallet(wallet: WalletEntity): Promise<WalletEntity> {
    if (!wallet.walletHash) {
      updateWalletHash(wallet);
      return boot(wallet.id);
    }

    try {
      await importWalletFile(wallet.walletHash);
    } catch {
      await exportWalletFile(wallet.id);
    }

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

    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (
          name, 
          mnemonic, 
          passphrase, 
          derivation,
          walletHash
        ) VALUES (?, ?, ?, ?, ?) RETURNING *`,
        [name, mnemonic, passphrase, derivation, walletHash]
      )
    )[0];

    Log.log("creating wallet", result);

    saveDatabase();
    return result;
  }

  // importWallet: import a wallet via provided seed phrase
  // persist the imported wallet in the database
  function importWallet(
    mnemonic: string,
    passphrase: string = "",
    derivation: ValidDerivationPath = DEFAULT_DERIVATION_PATH,
    name: string = "Imported Wallet"
  ): WalletEntity {
    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    const result = resultToJson(
      db.exec(
        `INSERT INTO wallets (
          name, 
          mnemonic, 
          passphrase, 
          derivation, 
          walletHash,
          key_viewed
        ) VALUES (
          ?, ?, ?, ?, ?,
          strftime('%Y-%m-%dT%H:%M:%SZ')
        ) RETURNING *`,
        [name, mnemonic, passphrase, derivation, walletHash]
      )
    )[0];

    Log.log("importing wallet", result);

    saveDatabase();
    return result;
  }

  async function deleteWallet(wallet_id: number) {
    clearWalletData(wallet_id);

    db.run(
      `DELETE FROM transactions WHERE txid IN (SELECT txid FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}"))`
    );

    db.run(`DELETE FROM wallets WHERE id="${wallet_id}"`);

    const { walletHash } = resultToJson(
      db.exec(`SELECT walletHash FROM wallets WHERE id='${wallet_id}'`)
    )[0];

    await deleteWalletFile(walletHash);
    saveDatabase();
  }

  // updateKeyViewed: updates the wallet's key_viewed timestamp
  function updateKeyViewed(wallet_id: number): string {
    const result = resultToJson(
      db.exec(
        `UPDATE wallets SET key_viewed=strftime('%Y-%m-%dT%H:%M:%SZ') WHERE id='${wallet_id}' RETURNING key_viewed`
      )
    )[0];

    Log.debug("keyViewed", result);

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
  async function setWalletName(wallet_id: number, name: string): void {
    db.run(`UPDATE wallets SET name=? WHERE id="${wallet_id}"`, [name]);
    saveDatabase();
    await exportWalletFile(wallet_id);
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

  function calculateWalletHash(wallet: WalletStub): string {
    const mnemonicHash = sha256.text(wallet.mnemonic);
    const passphraseHash =
      wallet.passphrase !== "" ? sha256.text(wallet.passphrase) : "";
    const derivationHash = sha256.text(wallet.derivation);

    const concatHashes = [mnemonicHash, passphraseHash, derivationHash].join(
      ""
    );

    const walletHash = sha256.text(concatHashes);
    return walletHash;
  }

  function updateWalletHash(wallet: WalletEntity) {
    const walletHash = calculateWalletHash(wallet);

    db.run(
      `UPDATE wallets SET walletHash="${walletHash}" WHERE id="${wallet.id}"`
    );

    saveDatabase();
  }

  async function exportWalletFile(wallet_id: number) {
    const { mnemonic, passphrase, derivation, date_created, name } =
      await getWalletById(wallet_id);

    const walletHash = calculateWalletHash({
      mnemonic,
      passphrase,
      derivation,
    });

    const walletData = {
      walletHash,
      mnemonic,
      passphrase,
      derivation,
      date_created,
      name,
    };

    const result = await Filesystem.writeFile({
      path: `/selene/wallets/${walletHash}.wallet.json`,
      directory: Directory.Library,
      recursive: true,
      data: JSON.stringify(walletData),
      encoding: Encoding.UTF8,
    });

    Log.debug("exportWalletFile", result, walletData);
    return result;
  }

  async function importWalletFile(walletHash) {
    const walletFile = await Filesystem.readFile({
      path: `/selene/wallets/${walletHash}.wallet.json`,
      directory: Directory.Library,
    });

    const walletData = JSON.parse(walletFile.data.toString());
    Log.debug("importWalletFile", walletData);
    return walletData;
  }

  async function deleteWalletFile(walletHash) {
    try {
      await Filesystem.deleteFile({
        path: `/selene/wallets/${walletHash}.wallet.json`,
        directory: Directory.Library,
      });
      Log.debug("deleteWalletfile", walletHash);
    } catch (e) {
      Log.warn(e);
    }
  }
}
