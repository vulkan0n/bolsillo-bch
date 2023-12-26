import Logger from "js-logger";
import { sha256 } from "@bitauth/libauth";
import DatabaseService from "@/services/DatabaseService";
import HdNodeService from "@/services/HdNodeService";
import { binToHex } from "@/util/hex";
import { WalletEntity } from "@/services/WalletManagerService";

export interface AddressEntity {
  address: string;
  hd_index: number;
  wallet_id: number;
  change: number;
  balance: number;
  state: string | null;
  memo: string;
}

// AddressManagerService: handles most address-related operations
export default function AddressManagerService(wallet: WalletEntity) {
  //Logger.debug("AddressManagerService", wallet);

  const { db, resultToJson, saveDatabase } = DatabaseService();
  const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit is 20

  return {
    populateAddresses,
    getAddress,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    getRecentAddresses,
    updateAddressBalance,
    updateAddressState,
    getAddressTransactions,
    calculateAddressState,
    getAddressState,
    registerTransaction,
  };

  // --------------------------------

  // register an address into the database
  function _registerAddress(
    address: string,
    hd_index: number,
    change: number = 0
  ): AddressEntity {
    /*Logger.debug(
      `registerAddress${change ? " change" : ""}`,
      hd_index,
      address
    );*/

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

    //Logger.debug("registerAddress", result);

    return result;
  }

  // populateAddresses: derive new addresses such that
  // there are always at least $ADDRESS_GAP_LIMIT addresses
  // returns an array of generated addresses
  function populateAddresses(): Array<AddressEntity> {
    const hdWallet = HdNodeService(wallet);

    function populate(change: number): Array<AddressEntity> {
      const generated: Array<AddressEntity> = [];

      const latestAddress =
        (change ? getChangeAddresses(1)[0] : getReceiveAddresses(1)[0]) || null;
      const nextHdIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      const latestUsedAddress = getRecentAddresses(1, change)[0] || null;
      const latestUsedIndex =
        latestUsedAddress !== null ? latestUsedAddress.hd_index : -1;

      const unusedAddresses = getUnusedAddresses(0, change);
      const unusedAddressCount = unusedAddresses.length;

      const scanEndIndex = nextHdIndex + ADDRESS_GAP_LIMIT;

      /*Logger.debug(
        "populate",
        change ? "change" : "receive",
        `next: ${nextHdIndex}`,
        `end: ${scanEndIndex}`,
        `unused: ${unusedAddressCount}`,
        `latest: ${latestUsedIndex}`,
        `diff: ${nextHdIndex - latestUsedIndex}`
      );*/

      // starting from latest index, generate new addresses
      if (
        unusedAddressCount < ADDRESS_GAP_LIMIT ||
        nextHdIndex - latestUsedIndex <= ADDRESS_GAP_LIMIT
      ) {
        for (
          let hd_index = nextHdIndex;
          hd_index < scanEndIndex;
          hd_index += 1
        ) {
          const newAddress = hdWallet.generateAddress(hd_index, change);

          generated.push(_registerAddress(newAddress, hd_index, change));
        }
      }

      return generated;
    }

    const generatedAddresses = [...populate(0), ...populate(1)];
    //Logger.debug("populateAddresses", generatedAddresses);
    return generatedAddresses;
  }

  function getAddress(address: string): AddressEntity | null {
    const result = resultToJson(
      db.exec(`SELECT * FROM addresses WHERE address="${address}"`)
    );

    return result.length > 0 ? result[0] : null;
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

    //Logger.log("getReceiveAddresses", limit, result);
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

    //Logger.log("getChangeAddresses", limit, result);
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

    Logger.debug("getUnusedAddress", limit, wallet, result);
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
          LIMIT ${limit}
        ;`
      )
    );

    //Logger.debug("getRecentAddresses", limit, result);
    return result;
  }

  // updateAddressState: updates address state in db
  // returns true if update actually happened, false if up-to-date
  function updateAddressState(address: string, state: string | null): boolean {
    if (state === "null" || state === null) {
      return false;
    }

    const result = resultToJson(
      db.exec(
        `UPDATE addresses SET 
          state="${state}" 
         WHERE (
          address="${address}" 
          AND state IS DISTINCT FROM "${state}" 
        ) RETURNING *;`
      )
    );

    const didUpdate = result.length > 0;
    if (didUpdate) {
      saveDatabase();
    }

    return didUpdate;
  }

  // updateAddressBalance: updates balance for address in database
  // returns total wallet balance
  function updateAddressBalance(address: string, balance: number) {
    const previousBalance = resultToJson(
      db.exec(`SELECT balance FROM wallets WHERE id="${wallet.id}"`)
    )[0].balance;

    db.run(
      `UPDATE addresses SET balance="${balance}" WHERE address="${address}";`
    );

    const currentBalance = resultToJson(
      db.exec(`SELECT balance FROM wallets WHERE id="${wallet.id}"`)
    )[0].balance;

    const { change } = resultToJson(
      db.exec(`SELECT change FROM addresses WHERE address="${address}";`)
    )[0];

    const isChange = Number.parseInt(change, 10) !== 0;

    saveDatabase();
    return {
      previousBalance,
      currentBalance,
      isChange,
    };
  }

  function getAddressTransactions(address: string) {
    const confirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height > 0
          ORDER BY height 
        ;`
      )
    );

    const unconfirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height <= 0
        ;`
      )
    );

    //Logger.log("getAddressTransactions", confirmed, unconfirmed, address);
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

    const stateHash = binToHex(
      sha256.hash(new TextEncoder().encode(stateString))
    );

    //Logger.debug("calculateAddressState", stateHash, stateString, address);
    return stateHash;
  }

  // getAddressState: get stored state hash for address
  function getAddressState(address: string): string | null {
    const result = resultToJson(
      db.exec(`SELECT state FROM addresses WHERE address="${address}"`)
    );

    //Logger.log("getAddressState", result, address);
    return result.length > 0 ? result[0].state : null;
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(address: string, tx): void {
    //Logger.debug("AddressManager.registerTransaction", address, tx);

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
  }
}
