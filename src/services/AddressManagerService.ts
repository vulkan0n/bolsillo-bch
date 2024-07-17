import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { WalletEntity } from "@/services/WalletManagerService";
import { sha256 } from "@/util/hash";

const Log = LogService("AddressManager");

export interface AddressStub {
  address: string;
  hd_index: number;
  change: number;
  state: string | null;
}

export interface AddressEntity extends AddressStub {
  wallet_id: number;
  balance: number;
  memo: string;
}

export class AddressNotExistsError extends Error {
  constructor(address: string) {
    super(`No Address ${address}`);
  }
}

// AddressManagerService: handles most address-related operations
export default function AddressManagerService(wallet: WalletEntity) {
  //Log.debug("AddressManagerService", wallet);

  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    registerAddress,
    getAddress,
    getAddressRange,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    getRecentAddresses,
    updateAddressState,
    getAddressTransactions,
    calculateAddressState,
    registerTransaction,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(
    address: string,
    hd_index: number,
    change: number = 0
  ): AddressEntity {
    //Log.debug(`registerAddress${change ? " change" : ""}`, hd_index, address);

    try {
      const result = resultToJson(
        db.exec(
          `INSERT INTO addresses (
        address, 
        wallet_id, 
        hd_index,
        change,
        prefix
      ) 
      VALUES (
        "${address}", 
        "${wallet.id}", 
        "${hd_index}",
        "${change}",
        "${wallet.prefix}"
      ) RETURNING *;`
        )
      )[0];

      saveDatabase();
      //Log.debug("registerAddress", result);
      return result;
    } catch (e) {
      const addr = getAddress(address);
      //Log.debug("getAddress (register)", addr);
      return addr;
    }
  }

  function getAddress(address: string): AddressEntity {
    const result = resultToJson(
      db.exec(`SELECT * FROM addresses WHERE address="${address}"`)
    );

    if (result.length < 1) {
      throw new AddressNotExistsError(address);
    }

    return result[0];
  }

  function getAddressRange(
    startIndex: number = 0,
    endIndex: number = 20,
    change: number = 0
  ): Array<AddressEntity> {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses
          WHERE hd_index >= ${startIndex}
          AND hd_index <= ${endIndex}
          AND change=${change}
          AND wallet_id=${wallet.id}
        ;`
      )
    );

    Log.debug("getAddressRange", startIndex, endIndex, result);

    return result;
  }

  // getReceiveAddresses: get all active receive addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  function getReceiveAddresses(limit: number = 0): Array<AddressEntity> {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet.id}" 
          AND change='0' 
          AND prefix='${wallet.prefix}'
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
      )
    );

    //Log.log("getReceiveAddresses", limit, result);
    return result;
  }

  // getChangeAddresses: get all active change addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  // NB: If you want first UNUSED change address,
  // instead use getUnusedAddress(limit, 1)
  function getChangeAddresses(limit: number = 0): Array<AddressEntity> {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet.id}"
          AND change="1" 
          AND prefix="${wallet.prefix}"
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
      )
    );

    //Log.log("getChangeAddresses", limit, result);
    return result;
  }

  // getUnusedAddresess: get the lowest-index unused recv addresses for wallet
  // in ASCENDING order so wallet consumes lowest-index first
  function getUnusedAddresses(
    limit: number = 5,
    change: number = 0
  ): Array<AddressEntity> {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet.id}"
          AND state IS NULL 
          AND change="${change}"
          AND prefix="${wallet.prefix}"
          ORDER BY hd_index ASC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
      )
    );

    //Log.debug("getUnusedAddress", limit, result);
    return result;
  }

  // getRecentAddresess: get the higest-index USED addresses for wallet
  // in DESCENDING order so wallet consumes most recent index first
  function getRecentAddresses(
    limit: number = 20,
    change: number = 0
  ): Array<AddressEntity> {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet.id}"
          AND state IS NOT NULL 
          AND change="${change}"
          AND prefix="${wallet.prefix}"
          ORDER BY hd_index DESC 
          ${limit ? `LIMIT ${limit}` : ""}
        ;`
      )
    );

    //Log.debug("getRecentAddresses", limit, result);
    return result;
  }

  // updateAddressState: updates address state in db
  function updateAddressState(address: string, state: string | null): void {
    const s = state === null ? "NULL" : `'${state}'`;

    db.exec(
      `UPDATE addresses SET 
          state=${s}
         WHERE (
             wallet_id="${wallet.id}"
             AND address="${address}" 
        );`
    );

    //Log.debug("updateAddressState", address, state);
    saveDatabase();
  }

  function getAddressTransactions(address: string) {
    const confirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE wallet_id="${wallet.id}" 
          AND address="${address}"
          AND height > 0
          ORDER BY height ASC
        ;`
      )
    );

    const unconfirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE wallet_id="${wallet.id}"
          AND address="${address}"
          AND height <= 0
        ;`
      )
    );

    //Log.log("getAddressTransactions", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  // calculateAddressState: calculate electrum address state using local tx history
  function calculateAddressState(address: string): string | null {
    const localHistory = getAddressTransactions(address);

    // return null if address has no transactions
    if (
      localHistory.confirmed.length === 0 &&
      localHistory.unconfirmed.length === 0
    ) {
      return null;
    }

    const txToState = (tx) => `${tx.txid}:${tx.height}:`;

    const stateString = localHistory.confirmed
      .map(txToState)
      .concat(localHistory.unconfirmed.map(txToState))
      .join("");

    const stateHash = sha256.text(stateString);

    //Log.debug("calculateAddressState", stateHash, stateString, address);
    return stateHash;
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(
    address: string,
    tx: { tx_hash: string; height: number }
  ): void {
    try {
      db.run(
        `INSERT INTO address_transactions (
        txid,
        height,
        address,
        wallet_id
      ) VALUES (
        "${tx.tx_hash}",
        "${tx.height}",
        "${address}",
        "${wallet.id}"
      ) ON CONFLICT DO 
        UPDATE SET 
          height="${tx.height}";
      `
      );
    } catch (e) {
      Log.error(e);
    }

    //Log.debug("AddressManager.registerTransaction", address, tx, wallet.id);
    saveDatabase();
  }
}
