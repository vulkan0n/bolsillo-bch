import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { DUST_LIMIT } from "@/util/sats";
import { Decimal } from "decimal.js";

export default function UxtoManagerService(wallet_id) {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getWalletUtxos,
    getAddressUtxos,
    selectUtxos,
    discardUtxo,
    discardAddressUtxos,
  };

  function registerUtxo(address, utxo) {
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

  function selectUtxos(amount, fee) {
    const targetAmount = new Decimal(amount).plus(fee).toNumber();

    // all full address balances >= amount are eligible
    const eligibleAddresses = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE 
            balance >= "${targetAmount}"
            AND wallet_id="${wallet_id}"
          ORDER BY balance ASC`
      )
    );

    // 1. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance == targetAmount
    );
    if (exactAddresses.length > 0) {
      return getAddressUtxos(exactAddresses[0].address);
    }

    // all UTXOs <= targetAmount are eligible
    const eligibleUtxos = resultToJson(
      db.exec(
        `SELECT * FROM address_utxos 
          WHERE 
            amount <= "${targetAmount}" 
            AND wallet_id="${wallet_id}" 
          ORDER BY amount DESC`
      )
    );

    // 2. if there's an exact UTXO, use that UTXO and its address-mates
    const exactUtxos = eligibleUtxos.filter(
      (utxo) => utxo.amount == targetAmount
    );
    if (exactUtxos.length > 0) {
      return [exactUtxos[0], ...getAddressUtxos(exactUtxos[0].address)];
    }

    // 3. try to consolidate enough UTXOs to make the targetAmount
    const eligibleSum = eligibleUtxos.reduce((sum, cur) => sum + cur.amount, 0);

    // 4. if sum of utxos matches exactly, consolidate the UTXOs
    if (eligibleSum == targetAmount) {
      return eligibleUtxos;
    }

    // 5. if consolidating won't be enough, use entire balance of next-eligible address
    if (eligibleSum < targetAmount) {
      if (eligibleAddresses.length > 0) {
        return getAddressUtxos(eligibleAddresses[0].address);
      } else {
        // if no eligible address, return empty set
        return [];
      }
    }

    // if there's enough change that consolidating will work, find the smallest combo
    const selection = [];
    let remainingAmount = targetAmount;

    while (remainingAmount > 0 && eligibleUtxos.length > 0) {
      const utxo = eligibleUtxos.shift();
      selection.push(utxo);
      remainingAmount = remainingAmount - utxo.amount;
    }

    if (remainingAmount > 0) {
      return [];
    }

    const utxoChange = remainingAmount * -1 - fee;
    const utxoFee = utxoChange > DUST_LIMIT ? fee : fee + utxoChange;

    if (eligibleAddresses.length > 0) {
      const eligibleAddress = eligibleAddresses[0];
      const addressChange = eligibleAddress.balance - targetAmount - fee;
      const addressFee = addressChange > DUST_LIMIT ? fee : fee + addressChange;

      if (addressFee < utxoFee) {
        return getAddressUtxos(eligibleAddress.address);
      }
    }

    return selection;
  }

  function discardUtxo(utxo) {
    db.run(
      `DELETE FROM address_utxos WHERE txid="${utxo.tx_hash}" AND tx_pos="${utxo.tx_pos}"`
    );

    saveDatabase();
  }

  function discardAddressUtxos(address) {
    db.run(`DELETE FROM address_utxos WHERE address="${address}";`);

    saveDatabase();
  }
}
