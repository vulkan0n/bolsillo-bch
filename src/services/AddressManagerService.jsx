import DatabaseService from "@/services/DatabaseService";
import HdNodeService from "@/services/HdNodeService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";
import { crypto } from "@/util/crypto";
import { toHex } from "@/util/hex";

export default function AddressManagerService(id) {
  const wallet_id = id ? id : selectActiveWallet(store.getState()).id;
  //console.log("AddressManagerService", wallet_id);

  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerAddress,
    populateAddresses,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    updateAddressState,
    updateAddressBalance,
    calculateAddressState,
    registerTransaction,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(address, hd_index, change = 0) {
    console.log(`registerAddress${change ? " change" : ""}`, hd_index, address);

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

  // clearAddresses: delete all addresses from database
  function clearAddresses() {
    db.run("DELETE FROM addresses;");
    saveDatabase();
  }

  // populateAddresses: generate addresses such that
  // we always have ADDRESS_GAP_LIMIT unused addresses
  function populateAddresses() {
    const ADDRESS_GAP_LIMIT = 20 / 4; // BIP-44 gap limit is 20
    let unused = getUnusedAddresses(ADDRESS_GAP_LIMIT);
    let generatedAddresses = [];

    const hdWallet = new HdNodeService(wallet_id);
    if (unused.length < ADDRESS_GAP_LIMIT) {
      const latestAddress = getReceiveAddresses(1)[0] || null;
      const latestIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      for (
        let hd_index = latestIndex;
        hd_index < latestIndex + ADDRESS_GAP_LIMIT - unused.length;
        hd_index = hd_index + 1
      ) {
        const newAddress = hdWallet.generateAddress(hd_index);
        registerAddress(newAddress, hd_index);
        generatedAddresses.push(newAddress);
      }
    }

    return generatedAddresses;
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
  function getUnusedAddresses(limit = 5) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE wallet_id=${wallet_id} 
          AND state IS NULL 
          AND change='0' 
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

  function updateAddressBalance(address, balance) {
    db.run(
      `UPDATE addresses SET balance="${balance}" WHERE address="${address}";`
    );

    const walletBalance = resultToJson(
      db.exec(`SELECT balance FROM wallets WHERE id="${wallet_id}"`)
    )[0].balance;

    //console.log("updateAddressBalance", address, balance, walletBalance);
    saveDatabase();
    return walletBalance;
  }

  function calculateAddressState(address) {
    const TransactionManager = new TransactionManagerService();
    const localHistory = TransactionManager.getTransactionsByAddress(address);

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

    const { sha256 } = crypto;
    const stateHash = toHex(sha256.hash(new TextEncoder().encode(stateString)));

    //console.log("calculateAddressState", stateHash, stateString, address);
    return stateHash;
  }

  function registerTransaction(address, tx) {
    console.log("AddressManager registerTransaction", tx, address);

    db.run(
      `INSERT OR IGNORE INTO transactions (
        txid,
        wallet_id,
        address,
        height
      ) VALUES (
        "${tx.tx_hash}",
        "${wallet_id}",
        "${address}",
        "${tx.height}"
      );`
    );

    db.run(
      `UPDATE transactions SET 
        wallet_id="${wallet_id}",
        address="${address}",
        height="${tx.height}"
      WHERE txid="${tx.txid}";`
    );
  }
}
