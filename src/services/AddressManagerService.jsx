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
    getAddressByState,
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

  function populateAddresses() {
    /*db.run("DELETE FROM addresses;");
    saveDatabase();*/

    const ADDRESS_GAP_LIMIT = 20 / 4; // BIP-44 gap limit is 20
    const unused = getUnusedAddresses(ADDRESS_GAP_LIMIT);

    if (unused.length < ADDRESS_GAP_LIMIT) {
      const latestAddress = getReceiveAddresses(1)[0] || "";
      const latestIndex = latestAddress !== "" ? latestAddress.hd_index + 1 : 0;

      const hdWallet = new HdNodeService(wallet_id);
      for (
        let i = latestIndex;
        i < ADDRESS_GAP_LIMIT - unused.length + latestIndex;
        i++
      ) {
        const newAddress = hdWallet.generateAddress(i);
        registerAddress(newAddress, i);
      }
    }
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

    console.log("getChangeAddresses", result);
    return result;
  }

  // get the lowest-index unused receive address for this wallet
  function getUnusedAddresses(limit = 5) {
    const result = resultToJson(
      db.exec(
        `SELECT address FROM addresses WHERE wallet_id=${wallet_id} AND state IS NULL AND change='0' ORDER BY hd_index ASC LIMIT ${limit}`
      )
    ).map((address) => address);

    //=console.log("getUnusedAddress", result);
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
    const result = resultToJson(
      db.exec(`SELECT * FROM addresses WHERE state LIKE "${addressState}"`)
    );

    return result.length > 0 ? result[0] : null;
  }
}

export default AddressManagerService;
