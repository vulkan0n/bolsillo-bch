import DatabaseService from "./DatabaseService.jsx";
import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";

function AddressManagerService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  const wallet_id = selectActiveWallet(store.getState()).id;

  return {
    registerAddress,
    getReceiveAddresses,
    getChangeAddresses,
    getUnusedAddresses,
    updateAddressState,
  };

  // --------------------------------

  // register an address into the database
  function registerAddress(address, index) {
    console.log("registerAddress", address, index);

    db.run(
      `INSERT INTO addresses (address, wallet_id, hd_index) VALUES ("${address}", "${wallet_id}", "${index}")`
    );
  }

  // get all active receive addresses for this wallet
  function getReceiveAddresses() {
    const result = resultToJson(
      db.exec(
        `SELECT address FROM addresses WHERE wallet_id="${wallet_id}" AND change='0' ORDER BY hd_index`
      )
    ).map((address) => address.address);

    console.log("getReceiveAddresses", result);
    return result;
  }

  // get all active change addresses for this wallet
  function getChangeAddresses() {
    const result = resultToJson(
      db.exec(
        `SELECT address, hd_index FROM addresses WHERE wallet_id=${wallet_id} AND change='1' ORDER BY hd_index`
      )
    );

    console.log("getChangeAddresses", result);
    return result;
  }

  // get the lowest-index unused receive address for this wallet
  function getUnusedAddresses(limit = 5) {
    const result = resultToJson(
      db.exec(
        `SELECT address FROM addresses WHERE wallet_id=${wallet_id} AND ntxin < 1 AND ntxout < 1 AND change='0' ORDER BY hd_index ASC LIMIT ${limit}`
      )
    ).map((address) => address.address);

    console.log("getUnusedAddress", result);
    return result;
  }

  function updateAddressState(address, state) {
    const result = resultToJson(
      db.exec(
        `UPDATE addresses SET state="${state}" WHERE address="${address}" AND state NOT LIKE "${state}" RETURNING *`
      )
    );
    saveDatabase();
    console.log(result);
    return result.length > 0;
  }
}

export default AddressManagerService;
