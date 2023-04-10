import DatabaseService from "@/services/DatabaseService";
import HdNodeService from "@/services/HdNodeService";
import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";

function AddressManagerService(id) {
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
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(address, index) {
    console.log("registerAddress", address, index);

    db.run(
      `INSERT INTO addresses (address, wallet_id, hd_index) VALUES ("${address}", "${wallet_id}", "${index}")`
    );

    saveDatabase();
  }

  function clearAddresses() {
    db.run("DELETE FROM addresses;");
    saveDatabase();
  }

  function populateAddresses() {
    //clearAddresses();
    //return;

    const ADDRESS_GAP_LIMIT = 20; // BIP-44 gap limit is 20
    let unused = getUnusedAddresses(ADDRESS_GAP_LIMIT);
    let addressesGenerated = 0;

    const hdWallet = new HdNodeService(wallet_id);
    if (unused.length < ADDRESS_GAP_LIMIT) {
      const latestAddress = getReceiveAddresses(1)[0] || null;
      const latestIndex =
        latestAddress !== null ? latestAddress.hd_index + 1 : 0;

      for (
        let i = latestIndex;
        i < ADDRESS_GAP_LIMIT - unused.length + latestIndex;
        i++
      ) {
        const newAddress = hdWallet.generateAddress(i);
        registerAddress(newAddress, i);
        addressesGenerated = addressesGenerated + 1;
      }
    }

    return addressesGenerated;
  }

  // get all active receive addresses for this wallet
  function getReceiveAddresses(limit) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM addresses WHERE wallet_id="${wallet_id}" AND change='0' ORDER BY hd_index DESC ${
          limit ? `LIMIT ${Number.parseInt(limit)}` : ""
        }`
      )
    );

    //console.log("getReceiveAddresses", result, limit);
    return result;
  }

  // get all active change addresses for this wallet
  function getChangeAddresses() {
    const result = resultToJson(
      db.exec(
        `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet_id} AND change='1' ORDER BY hd_index DESC`
      )
    );

    //console.log("getChangeAddresses", result);
    return result;
  }

  // get the lowest-index unused receive address for this wallet
  function getUnusedAddresses(limit = 5) {
    const result = resultToJson(
      db.exec(
        `SELECT address FROM addresses WHERE wallet_id=${wallet_id} AND state IS NULL AND change='0' ORDER BY hd_index ASC LIMIT ${limit}`
      )
    ).map((address) => address);

    //console.log("getUnusedAddress", result);
    return result;
  }

  // updateAddressState: updates address state in db
  // returns true if update actually happened, false if up-to-date
  function updateAddressState(address, state) {
    const result = resultToJson(
      db.exec(
        `UPDATE addresses SET state="${state}" WHERE address="${address}" AND state IS DISTINCT FROM "${state}" RETURNING *`
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
      `UPDATE addresses SET balance="${balance}" WHERE address="${address}"`
    );

    const walletBalance = resultToJson(
      db.exec(
        `UPDATE wallets SET balance=(SELECT SUM(balance) FROM addresses WHERE wallet_id="${wallet_id}") RETURNING balance`
      )
    )[0].balance;

    console.log("updateAddressBalance", address, balance, walletBalance);
    saveDatabase();
    return walletBalance;
  }
}

export default AddressManagerService;
