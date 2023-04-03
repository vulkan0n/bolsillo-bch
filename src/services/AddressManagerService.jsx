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
    updateAddressBalance,
    getAddressByState,
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
        `SELECT * FROM addresses WHERE wallet_id="${wallet_id}" AND change='0' ORDER BY hd_index`
      )
    );

    //console.log("getReceiveAddresses", result);
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

    //console.log("getUnusedAddress", result);
    return result;
  }

  function updateAddressState(address, state) {
    const result = resultToJson(
      db.exec(
        `UPDATE addresses SET state="${state}" WHERE address="${address}" RETURNING *`
      )
    );
    saveDatabase();
    //console.log(result);
    return result.length > 0;
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

    console.log("requestBalance", address, balance, walletBalance);
    saveDatabase();
    return walletBalance;
  }

  function getAddressByState(addressState) {
    console.log("getAddressByState", addressState);
    const result = resultToJson(
      db.exec(`SELECT * FROM addresses WHERE state LIKE "${addressState}"`)
    );

    return result.length > 0 ? result[0] : null;
  }
}

export default AddressManagerService;
