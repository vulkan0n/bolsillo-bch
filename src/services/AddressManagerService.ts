import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { sha256 } from "@/util/hash";

const Log = LogService("AddressManager");

export interface AddressStub {
  address: string;
  hd_index: number;
  change: number;
  state: string | null;
}

export interface AddressEntity extends AddressStub {
  balance: number;
  memo: string;
}

export class AddressNotExistsError extends Error {
  constructor(address: string) {
    super(`No Address ${address}`);
  }
}

// AddressManagerService: handles most address-related operations
export default function AddressManagerService(walletHash: string) {
  //Log.debug("AddressManagerService", wallet);
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(walletHash);

  return {
    registerAddress,
    getAddress,
    getAddressRange,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    getReusedAddresses,
    //getRecentAddresses,
    getWalletConnectAddress,
    getAddressTransactions,
    calculateAddressState,
    nullifyAddressState,
    registerTransaction,
    registerTransactions,
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
      const result = walletDb.exec(
        `INSERT INTO addresses (
          address, 
          hd_index,
          change
        ) 
        VALUES (?, ?, ?)
        RETURNING *;`,
        [address, hd_index, change]
      )[0];

      //Log.debug("registerAddress", result);
      return result;
    } catch (e) {
      Log.error(e);
      throw e;
    }
  }

  function getAddress(address: string): AddressEntity {
    const result = walletDb.exec("SELECT * FROM addresses WHERE address=?", [
      address,
    ]);

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
    const result = walletDb.exec(
      `SELECT * FROM addresses
          WHERE hd_index >= ?
          AND hd_index <= ?
          AND change=?
        ;`,
      [startIndex, endIndex, change]
    );

    Log.debug("getAddressRange", startIndex, endIndex, result);

    return result;
  }

  // getReceiveAddresses: get all active receive addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  function getReceiveAddresses(limit: number = 0): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE change='0' 
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.log("getReceiveAddresses", limit, result);
    return result;
  }

  // getChangeAddresses: get all active change addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  // NB: If you want first UNUSED change address,
  // instead use getUnusedAddress(limit, 1)
  function getChangeAddresses(limit: number = 0): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE change="1" 
          ORDER BY hd_index DESC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`
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
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE state IS NULL 
          AND change=?
          ORDER BY hd_index ASC 
          ${limit > 0 ? `LIMIT ${limit}` : ""}
        ;`,
      [change]
    );

    //Log.debug("getUnusedAddress", limit, result);
    return result;
  }

  function getReusedAddresses(): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses a
        WHERE (
          SELECT COUNT(*) FROM address_transactions t 
            WHERE t.address = a.address
        ) > 3;`
    );

    //Log.debug("getReusedAddresses", result);
    return result;
  }

  function getWalletConnectAddress(): AddressEntity {
    const result = walletDb.exec(
      "SELECT * FROM addresses WHERE hd_index=0 AND change=0"
    );

    if (result.length < 1) {
      throw new AddressNotExistsError("walletconnect");
    }

    return result[0];
  }

  /*
   * TODO: maybe make this return recently-used addresses by time or blockheight instead
   *
  // getRecentAddresess: get the higest-index USED addresses for wallet
  // in DESCENDING order so wallet consumes most recent index first
  function getRecentAddresses(
    limit: number = 20,
    change: number = 0
  ): Array<AddressEntity> {
    const result = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE state IS NOT NULL 
          AND change="${change}"
          ORDER BY hd_index DESC 
          ${limit ? `LIMIT ${limit}` : ""}
        ;`
    );

    //Log.debug("getRecentAddresses", limit, result);
    return result;
  }
  */

  function getAddressTransactions(address: string) {
    const confirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE address=?
          AND height > 0
          ORDER BY height ASC, block_pos ASC
        ;`,
      [address]
    );

    const unconfirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE address=?
          AND height <= 0
        ;`,
      [address]
    );

    //Log.log("getAddressTransactions", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  // calculateAddressState: calculate electrum address state using local tx history
  function calculateAddressState(address: string): string | null {
    const localHistory = getAddressTransactions(address);

    //Log.debug("got localHistory", localHistory);

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

  function nullifyAddressState(address: string) {
    try {
      walletDb.run("UPDATE addresses SET state=NULL WHERE address=?", [
        address,
      ]);
    } catch (e) {
      Log.error("nullifyAddressState", e);
    }
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(
    address: string,
    tx: { tx_hash: string; height: number },
    blockPos: number | null = null
  ): void {
    try {
      const existing = walletDb.exec(
        "SELECT * FROM address_transactions WHERE txid=? AND address=?",
        [tx.tx_hash, address]
      );

      if (
        existing.length === 0 ||
        existing[0].height !== tx.height ||
        (existing[0].block_pos !== null && existing[0].block_pos !== blockPos)
      ) {
        walletDb.run(
          `INSERT INTO address_transactions (
          txid,
          height,
          address,
          block_pos
        ) VALUES ($tx_hash, $tx_height, $address, $block_pos)
        ON CONFLICT DO 
          UPDATE SET 
            height=$tx_height,
            block_pos=$block_pos
          WHERE txid=excluded.txid;
        `,
          {
            $tx_hash: tx.tx_hash,
            $tx_height: tx.height,
            $address: address,
            $block_pos: blockPos,
          }
        );
      }
    } catch (e) {
      Log.error(e);
      const r = walletDb.exec(
        "SELECT * FROM address_transactions WHERE txid=? AND address=?",
        [tx.tx_hash, address]
      );
      Log.warn(r[0]);
    }

    if (blockPos !== null) {
      TransactionManagerService().setBlockPos(tx.tx_hash, blockPos);
    }

    //Log.debug("AddressManager.registerTransaction", address, tx);
  }

  function registerTransactions(transactions) {
    //Log.debug("registerTransactions", transactions);
    try {
      const query = [
        ...transactions.map(
          (t) => `INSERT INTO address_transactions (
          txid,
          height,
          address,
          block_pos
        ) VALUES ("${t.tx_hash}", ${t.height}, "${t.address}", ${t.block_pos})
        ON CONFLICT DO 
          UPDATE SET 
            height=${t.height},
            block_pos=${t.block_pos}
          WHERE txid=excluded.txid;
        `
        ),
      ].join("");
      walletDb.run(query);

      TransactionManagerService().setBlockPosBulk(transactions);
    } catch (e) {
      Log.error(e);
      throw e;
    }
  }
}
