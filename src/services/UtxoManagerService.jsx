import { Decimal } from "decimal.js";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { DUST_LIMIT } from "@/util/sats";

const Log = LogService("UtxoManager");

export default function UxtoManagerService(wallet) {
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(wallet.walletHash);

  return {
    registerUtxo,
    getWalletUtxos,
    getAddressUtxos,
    selectUtxos,
    discardUtxo,
    discardAddressUtxos,
  };

  function registerUtxo(address, utxo) {
    walletDb.run(
      `INSERT INTO address_utxos (
        address,
        txid,
        tx_pos,
        amount,
        network
      ) VALUES (
        "${address}",
        "${utxo.tx_hash}",
        "${utxo.tx_pos}",
        "${utxo.value}",
        "${wallet.network}"
      );`
    );
  }

  function getWalletUtxos() {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE network="${wallet.network}"`
    );

    return result;
  }

  function getAddressUtxos(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address="${address}"`
    );
    return result;
  }

  function selectUtxos(amount, fee) {
    Log.debug("selectUtxos", amount, fee);
    const targetAmount = new Decimal(amount).plus(fee).toNumber();

    // all full address balances >= amount are eligible
    const eligibleAddresses = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE 
            balance >= "${targetAmount}"
            AND network="${wallet.network}"
          ORDER BY balance ASC`
    );

    Log.debug(
      "selectUtxos eligibleAddresses",
      eligibleAddresses.map((a) => a.address)
    );

    // 1. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === targetAmount
    );
    if (exactAddresses.length > 0) {
      Log.debug("selectUtxos exactAddress", exactAddresses[0].address);
      return getAddressUtxos(exactAddresses[0].address);
    }

    // all UTXOs <= targetAmount are eligible
    // Note: a UTXO > targetAmount implies an address > targetAmount, handled earlier
    const eligibleUtxos = walletDb.exec(
      `SELECT * FROM address_utxos 
          WHERE 
            amount <= "${targetAmount}" 
            AND network="${wallet.network}"
          ORDER BY amount DESC`
    );

    Log.debug("selectUtxos eligibleUtxos", eligibleUtxos.length);

    // 2. if there's an exact UTXO, use that UTXO and its address-mates
    const exactUtxos = eligibleUtxos.filter(
      (utxo) => utxo.amount === targetAmount
    );
    if (exactUtxos.length > 0) {
      Log.debug("selectUtxos exactUtxo", exactUtxos[0].address);
      return getAddressUtxos(exactUtxos[0].address);
    }

    // 3. try to consolidate enough UTXOs to make the targetAmount
    const eligibleUtxoSum = eligibleUtxos.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );

    // 4. if sum of utxos matches exactly, consolidate the UTXOs
    if (eligibleUtxoSum === targetAmount) {
      Log.debug("selectUtxos exactUtxoSum", eligibleUtxos);
      return eligibleUtxos;
    }

    // 5. check if consolidating will be enough, if not then use entire balance of next-eligible address
    if (eligibleUtxoSum < targetAmount) {
      if (eligibleAddresses.length > 0) {
        const addressUtxos = getAddressUtxos(eligibleAddresses[0].address);
        Log.debug(
          "selectUtxos eligibleAddress",
          eligibleAddresses[0].address,
          addressUtxos,
          eligibleAddresses[0].balance
        );
        return addressUtxos;
      }
      // if consolidating won't be enough and no eligible address, return empty set
      Log.debug(
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
      Log.debug("selectUtxos insufficient funds", remainingAmount);
      return [];
    }

    // negative remainingAmount is change that needs to be returned to wallet
    const utxoChange = remainingAmount * -1 - fee;

    // if remaining change is under dust limit, add it to fee instead
    const utxoFee = utxoChange < DUST_LIMIT ? fee + utxoChange : fee;

    // 8. check if it's cheaper to spend an address vs consolidate utxos
    if (eligibleAddresses.length > 0) {
      const eligibleAddress = eligibleAddresses[0];
      const addressChange = eligibleAddress.balance - targetAmount - fee;
      const addressFee = addressChange < DUST_LIMIT ? fee + addressChange : fee;

      if (addressFee < utxoFee) {
        Log.debug("selectUtxos address is cheaper than consolidation");
        return getAddressUtxos(eligibleAddress.address);
      }
    }

    Log.debug("selectUtxos selection", selection);
    return selection;
  }

  function discardUtxo(utxo) {
    walletDb.run(
      `DELETE FROM address_utxos WHERE txid="${utxo.tx_hash}" AND tx_pos="${utxo.tx_pos}";`
    );
  }

  function discardAddressUtxos(address) {
    walletDb.run(`DELETE FROM address_utxos WHERE address="${address}";`);
  }
}
