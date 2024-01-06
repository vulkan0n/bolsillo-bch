import Logger from "js-logger";
import { Decimal } from "decimal.js";
import DatabaseService from "@/services/DatabaseService";
import { DUST_LIMIT } from "@/util/sats";

export default function UxtoManagerService(wallet) {
  const { db, resultToJson, saveDatabase } = DatabaseService();

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
        amount,
        prefix
      ) VALUES (
        "${wallet.id}",
        "${address}",
        "${utxo.tx_hash}",
        "${utxo.tx_pos}",
        "${utxo.value}",
        "${wallet.prefix}"
      )`
    );

    Logger.debug("registerUtxo", utxo.tx_hash, utxo.tx_pos, utxo.value);

    saveDatabase();
  }

  function getWalletUtxos() {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM address_utxos WHERE wallet_id="${wallet.id}" AND prefix="${wallet.prefix}"`
      )
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
    Logger.debug("selectUtxos", amount, fee);
    const targetAmount = new Decimal(amount).plus(fee).toNumber();

    // all full address balances >= amount are eligible
    const eligibleAddresses = resultToJson(
      db.exec(
        `SELECT * FROM addresses 
          WHERE 
            balance >= "${targetAmount}"
            AND wallet_id="${wallet.id}"
            AND prefix="${wallet.prefix}"
          ORDER BY balance ASC`
      )
    );

    Logger.debug(
      "selectUtxos eligibleAddresses",
      eligibleAddresses.map((a) => a.address)
    );

    // 1. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === targetAmount
    );
    if (exactAddresses.length > 0) {
      Logger.debug("selectUtxos exactAddress", exactAddresses[0].address);
      return getAddressUtxos(exactAddresses[0].address);
    }

    // all UTXOs <= targetAmount are eligible
    const eligibleUtxos = resultToJson(
      db.exec(
        `SELECT * FROM address_utxos 
          WHERE 
            amount <= "${targetAmount}" 
            AND wallet_id="${wallet.id}" 
            AND prefix="${wallet.prefix}"
          ORDER BY amount DESC`
      )
    );

    Logger.debug("selectUtxos eligibleUtxos", eligibleUtxos.length);

    // 2. if there's an exact UTXO, use that UTXO and its address-mates
    const exactUtxos = eligibleUtxos.filter(
      (utxo) => utxo.amount === targetAmount
    );
    if (exactUtxos.length > 0) {
      Logger.debug("selectUtxos exactUtxo", exactUtxos[0].address);
      return getAddressUtxos(exactUtxos[0].address);
    }

    // 3. try to consolidate enough UTXOs to make the targetAmount
    const eligibleUtxoSum = eligibleUtxos.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );

    // 4. if sum of utxos matches exactly, consolidate the UTXOs
    if (eligibleUtxoSum === targetAmount) {
      Logger.debug("selectUtxos exactUtxoSum", eligibleUtxos);
      return eligibleUtxos;
    }

    // 5. if consolidating won't be enough, use entire balance of next-eligible address
    if (eligibleUtxoSum < targetAmount) {
      if (eligibleAddresses.length > 0) {
        const selection = getAddressUtxos(eligibleAddresses[0].address);
        Logger.debug(
          "selectUtxos eligibleAddress",
          eligibleAddresses[0].address,
          selection
        );
        return selection;
      }
      // if no eligible address, return empty set
      Logger.debug(
        "selectUtxos eligibleUtxoSum < targetAmount",
        eligibleUtxoSum,
        targetAmount
      );
      return [];
    }

    // 6. if there's enough change that consolidating will work, find the smallest combo
    const selection = [];
    let remainingAmount = targetAmount;

    // add eligible utxos to final selection
    while (remainingAmount > 0 && eligibleUtxos.length > 0) {
      const utxo = eligibleUtxos.shift();
      selection.push(utxo);
      remainingAmount -= utxo.amount;
    }

    // 7. if no more eligible utxos, insufficient funds
    // return empty selection
    if (remainingAmount > 0) {
      Logger.debug("selectUtxos insufficient funds", remainingAmount);
      return [];
    }

    // negative remainingAmount is change that needs to be returned to wallet
    const utxoChange = remainingAmount * -1 - fee;

    // if remaining change is under dust limit, add it to fee instead
    const utxoFee = utxoChange > DUST_LIMIT ? fee : fee + utxoChange;

    // 8. check if it's cheaper to spend an address vs consolidate utxos
    if (eligibleAddresses.length > 0) {
      const eligibleAddress = eligibleAddresses[0];
      const addressChange = eligibleAddress.balance - targetAmount - fee;
      const addressFee = addressChange > DUST_LIMIT ? fee : fee + addressChange;

      if (addressFee < utxoFee) {
        Logger.debug("selectUtxos address is cheaper than consolidation");
        return getAddressUtxos(eligibleAddress.address);
      }
    }

    Logger.debug("selectUtxos selection", selection);
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
