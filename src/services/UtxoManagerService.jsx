import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { DUST_LIMIT } from "@/util/sats";

export default function UxtoManagerService(wallet_id) {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getWalletUtxos,
    getAddressUtxos,
    selectUtxos,
    discardUtxo,
  };

  function registerUtxo(address, utxo) {
    console.log("registerUtxo", address, utxo);

    db.run(
      `INSERT INTO address_utxos (
        wallet_id,
        address,
        txid,
        tx_pos,
        amount
      ) VALUES (
        "${wallet_id}",
        "${address}",
        "${utxo.tx_hash}",
        "${utxo.tx_pos}",
        "${utxo.value}"
      )`
    );

    saveDatabase();
  }

  function getWalletUtxos() {
    const result = resultToJson(
      db.exec(`SELECT * FROM address_utxos WHERE wallet_id="${wallet_id}"`)
    );

    return result;
  }

  function getAddressUtxos(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM address_utxos WHERE address="${address}"`)
    );
    return result;
  }

  function selectUtxos(amount) {
    console.log("selectUtxos", amount);

    // all full address balances >= amount are eligible
    const eligibleAddresses = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE 
            balance >= "${amount}" 
            AND wallet_id="${wallet_id}"
          ORDER BY balance ASC`
      )
    );

    console.log("eligibleAddresses", eligibleAddresses);

    // 1. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === amount
    );
    if (exactAddresses.length > 0) {
      return getAddressUtxos(exactAddresses[0].address);
    }

    // all UTXOs <= amount are eligible
    const eligibleUtxos = resultToJson(
      db.exec(
        `SELECT * FROM address_utxos 
          WHERE 
            amount <="${amount}" 
            AND wallet_id="${wallet_id}" 
          ORDER BY amount DESC`
      )
    );

    console.log("eligibleUtxos", eligibleUtxos);

    // 2. if there's an exact UTXO, use that UTXO and its address-mates
    const exactUtxos = eligibleUtxos.filter((utxo) => utxo.amount === amount);
    if (exactUtxos.length > 0) {
      return [exactUtxos[0], ...getAddressUtxos(exactUtxos[0].address)];
    }

    // 3. try to consolidate enough UTXOs to make the amount
    const eligibleSum = eligibleUtxos.reduce((sum, cur) => sum + cur.amount, 0);

    console.log("eligibleSum", eligibleSum);

    // 4. if sum of utxos matches exactly, consolidate the UTXOs
    if (eligibleSum === amount) {
      return eligibleUtxos;
    }

    // 5. if consolidating won't be enough, use entire balance of next-eligible address
    if (eligibleSum < amount && eligibleAddresses.length > 0) {
      return getAddressUtxos(eligibleAddresses[0].address);
    }

    // if there's enough change that consolidating will work, find the smallest combo
    const selection = [];
    let remainingAmount = amount;
    let i = 0;

    while (remainingAmount > DUST_LIMIT && eligibleUtxos.length > 0) {
      const utxo = eligibleUtxos[i];
      if (utxo.amount <= remainingAmount) {
        selection.push(eligibleUtxos.shift());
        remainingAmount -= utxo.amount;
      } else {
        if (eligibleUtxos.length === 1) {
          return selection.push(eligibleUtxos.shift());
        }
      }

      i = i + (1 % eligibleUtxos.length);
    }

    const eligibleAddress = eligibleAddresses[0];
    if (eligibleAddress.balance - amount < remainingAmount) {
      return getAddressUtxos(eligibleAddress.address);
    }

    return selection;
  }

  function discardUtxo(utxo) {
    db.run(
      `DELETE FROM address_utxos WHERE txid="${utxo.tx_hash}" AND tx_pos="${utxo.tx_pos}"`
    );

    saveDatabase();
  }
}
