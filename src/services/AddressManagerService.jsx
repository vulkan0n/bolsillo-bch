import { sha256 } from "@bitauth/libauth";
import DatabaseService from "@/services/DatabaseService";
import HdNodeService from "@/services/HdNodeService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";
import { binToHex, hexToBin } from "@/util/hex";

// AddressManagerService: handles most address-related operations
export default function AddressManagerService(wallet_id) {
  //console.log("AddressManagerService", wallet_id);

  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerAddress,
    populateAddresses,
    getAddress,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    updateAddressBalance,
    updateAddressState,
    getAddressTransactions,
    calculateAddressState,
    getAddressState,
    registerTransaction,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(address, hd_index, change = 0) {
    //console.log(`registerAddress${change ? " change" : ""}`, hd_index, address);

    db.run(
      `INSERT INTO addresses (
        address, 
        wallet_id, 
        hd_index,
        change
      ) 
      VALUES (
        "${address}", 
        "${wallet_id}", 
        "${hd_index}",
        "${change}"
      );`
    );

    saveDatabase();
  }

  // populateAddresses: generate addresses such that
  // we always have ADDRESS_GAP_LIMIT unused addresses
  // returns an array of generated addresses
  function populateAddresses() {
    const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit is 20

    const generatedAddresses = [];

    const hdWallet = new HdNodeService(wallet_id);
    populate(0);
    populate(1);

    function populate(change) {
      const unused = getUnusedAddresses(ADDRESS_GAP_LIMIT, change);
      const latestAddress =
        (change ? getChangeAddresses(1)[0] : getReceiveAddresses(1)[0]) || null;
      const latestIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      for (
        let hd_index = latestIndex;
        hd_index < latestIndex + ADDRESS_GAP_LIMIT - unused.length;
        hd_index += 1
      ) {
        const newAddress = hdWallet.generateAddress(hd_index, change);
        registerAddress(newAddress, hd_index, change);
        generatedAddresses.push(newAddress);
      }
    }

    return generatedAddresses;
  }

  function getAddress(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM addresses WHERE address="${address}"`)
    );

    return result.length > 0 ? result[0] : null;
  }

  // getReceiveAddresses: get all active receive addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  function getReceiveAddresses(limit) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet_id}" 
          AND change='0' 
          ORDER BY hd_index DESC 
          ${limit ? `LIMIT ${Number.parseInt(limit)}` : ""}
        ;`
      )
    );

    //console.log("getReceiveAddresses", limit, result);
    return result;
  }

  // getChangeAddresses: get all active change addresses for this wallet
  // in DESCENDING order so we can get latest index with limit 1
  // NB: If you want first UNUSED change address,
  // instead use getUnusedAddress(limit, 1)
  function getChangeAddresses(limit) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id=${wallet_id} 
          AND change='1' 
          ORDER BY hd_index DESC 
          ${limit ? `LIMIT ${Number.parseInt(limit)}` : ""}
        ;`
      )
    );

    //console.log("getChangeAddresses", limit, result);
    return result;
  }

  // getUnusedAddresess: get the lowest-index unused recv addresses for wallet
  // in ASCENDING order so wallet consumes lowest-index first
  function getUnusedAddresses(limit = 5, change = 0) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id="${wallet_id}"
          AND state IS NULL 
          AND change="${change}"
          ORDER BY hd_index ASC 
          LIMIT ${limit}
        ;`
      )
    );

    //console.log("getUnusedAddress", limit, result);
    return result;
  }

  // updateAddressState: updates address state in db
  // returns true if update actually happened, false if up-to-date
  function updateAddressState(address, state) {
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
  function updateAddressBalance(address, balance) {
    const previousBalance = resultToJson(
      db.exec(`SELECT balance FROM wallets WHERE id="${wallet_id}"`)
    )[0].balance;

    db.run(
      `UPDATE addresses SET balance="${balance}" WHERE address="${address}";`
    );

    const walletBalance = resultToJson(
      db.exec(`SELECT balance FROM wallets WHERE id="${wallet_id}"`)
    )[0].balance;

    const { change } = resultToJson(
      db.exec(`SELECT change FROM addresses WHERE address="${address}";`)
    )[0];

    saveDatabase();
    return { previousBalance, walletBalance, change };
  }

  function getAddressTransactions(address) {
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

    //console.log("getAddressTransactions", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  // calculateAddressState: calculate electrum address state using local tx history
  function calculateAddressState(address) {
    const TransactionManager = new TransactionManagerService();
    const localHistory = new AddressManagerService().getAddressTransactions(
      address
    );

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

    //console.log("calculateAddressState", stateHash, stateString, address);
    return stateHash;
  }

  // getAddressState: get stored state hash for address
  function getAddressState(address) {
    const result = resultToJson(
      db.exec(`SELECT state FROM addresses WHERE address="${address}"`)
    );

    //console.log("getAddressState", result, address);
    return result.length > 0 ? result[0].state : null;
  }

  // AddressManager.registerTransaction: register a transaction with an address
  function registerTransaction(address, tx) {
    //console.log("AddressManager.registerTransaction", address, tx);
    db.run(
      `INSERT INTO address_transactions (
        txid,
        height,
        address
      ) VALUES (
        "${tx.tx_hash}",
        "${tx.height}",
        "${address}"
      ) ON CONFLICT DO 
        UPDATE SET 
          height="${tx.height}";
      `
    );
  }
}
