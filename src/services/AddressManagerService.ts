import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import HdNodeService from "@/services/HdNodeService";
import { WalletEntity } from "@/services/WalletManagerService";
import { sha256 } from "@/util/hash";

const Log = LogService("AddressManager");

export interface AddressEntity {
  address: string;
  hd_index: number;
  wallet_id: number;
  change: number;
  balance: number;
  state: string | null;
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
  const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit is 20

  return {
    registerAddress,
    populateAddresses,
    getAddress,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    getRecentAddresses,
    updateAddressState,
    getAddressTransactions,
    calculateAddressState,
    getAddressState,
    registerTransaction,
    cleanupAddressStates,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(
    address: string,
    hd_index: number,
    change: number = 0
  ): AddressEntity {
    Log.debug(`registerAddress${change ? " change" : ""}`, hd_index, address);

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
  }

  // populateAddresses: derive new addresses such that
  // there are always at least $ADDRESS_GAP_LIMIT addresses
  // returns an array of generated addresses
  function populateAddresses(nScanMore: number = 0): Array<AddressEntity> {
    const hdWallet = HdNodeService(wallet);

    function populate(change: number): Array<AddressEntity> {
      const generated: Array<AddressEntity> = [];

      const unusedAddresses = getUnusedAddresses(0, change);
      const unusedAddressCount = unusedAddresses.length;

      if (unusedAddressCount >= ADDRESS_GAP_LIMIT + nScanMore) {
        return [];
      }

      const latestAddress =
        (change ? getChangeAddresses(1)[0] : getReceiveAddresses(1)[0]) || null;
      const nextHdIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      const scanEndIndex = nextHdIndex + ADDRESS_GAP_LIMIT + nScanMore;

      // starting from latest index, generate new addresses
      for (let hd_index = nextHdIndex; hd_index < scanEndIndex; hd_index += 1) {
        const newAddress = hdWallet.generateAddress(hd_index, change);
        generated.push(registerAddress(newAddress, hd_index, change));
      }

      return generated;
    }

    const generatedAddresses = [...populate(0), ...populate(1)];
    //Log.debug("populateAddresses", generatedAddresses);
    return generatedAddresses;
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

    Log.log("getReceiveAddresses", limit, result);
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
  // returns true if update actually happened, false if up-to-date
  function updateAddressState(
    address: AddressEntity,
    state: string | null
  ): AddressEntity {
    const s = state === null ? "NULL" : `'${state}'`;
    const result = resultToJson(
      db.exec(
        `UPDATE addresses SET 
          state=${s}
         WHERE (
          address="${address.address}" 
        ) RETURNING *;`
      )
    )[0];

    //Log.debug("updateAddressState", state, result);
    saveDatabase();

    return result;
  }

  function getAddressTransactions(address: string) {
    const confirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height > 0
          AND wallet_id="${wallet.id}"
          ORDER BY height ASC
        ;`
      )
    );

    const unconfirmed = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions
          WHERE address="${address}"
          AND height <= 0
          AND wallet_id="${wallet.id}"
        ;`
      )
    );

    //Log.log("getAddressTransactions", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  // calculateAddressState: calculate electrum address state using local tx history
  function calculateAddressState(address: AddressEntity): string | null {
    const localHistory = getAddressTransactions(address.address);

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

  // getAddressState: get stored state hash for address
  function getAddressState(address: string): string | null {
    const result = resultToJson(
      db.exec(`SELECT state FROM addresses WHERE address="${address}"`)
    );

    //Log.log("getAddressState", result, address);
    return result.length > 0 ? result[0].state : null;
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(
    address: string,
    tx: { tx_hash: string; height: number }
  ): void {
    //Log.debug("AddressManager.registerTransaction", address, tx);

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

    saveDatabase();
  }

  function cleanupAddressStates() {
    const needsCleanup = resultToJson(
      db.exec(
        `SELECT address,state FROM addresses WHERE state LIKE "%Error%" OR state="null";`
      )
    );
    Log.warn(`Found ${needsCleanup.length} addresses needing state cleanup!`);
    db.run(
      `UPDATE addresses SET state=NULL WHERE address IN (SELECT address FROM addresses WHERE state LIKE "%Error%" OR state="null");`
    );
    Log.debug("Address cleanup done");

    saveDatabase();
  }
}
