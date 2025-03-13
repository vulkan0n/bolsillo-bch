import { Decimal } from "decimal.js";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import { DUST_LIMIT } from "@/util/sats";

const Log = LogService("UtxoManager");

export default function UtxoManagerService(walletHash: string) {
  const Database = DatabaseService();
  const walletDb = Database.getWalletDatabase(walletHash);

  return {
    registerUtxo,
    getWalletUtxos,
    getWalletCoins,
    getWalletTokens,
    getAddressUtxos,
    getAddressCoins,
    getAddressTokens,
    selectCoins,
    targetUtxos,
    discardUtxo,
    discardAddressUtxos,
  };

  function registerUtxo(address, utxo) {
    //Log.debug("registerUtxo", utxo);

    const token_data = utxo.token_data
      ? utxo.token_data
      : {
          category: null,
          amount: null,
          nft: {
            capability: null,
            commitment: null,
          },
        };

    try {
      walletDb.run(
        `INSERT INTO address_utxos (
        address,
        txid,
        tx_pos,
        amount,
        token_category,
        token_amount,
        nft_capability,
        nft_commitment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          address,
          utxo.tx_hash,
          utxo.tx_pos,
          utxo.value,
          token_data.category,
          token_data.amount,
          token_data.nft ? token_data.nft.capability : null,
          token_data.nft ? token_data.nft.commitment : null,
        ]
      );
    } catch (e) {
      Log.error(e);
    }
  }

  // returns all UTXOs for the wallet
  function getWalletUtxos() {
    const result = walletDb.exec(`SELECT * FROM address_utxos`);
    return result;
  }

  // returns all non-token UTXOs for the wallet
  function getWalletCoins() {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE token_category IS NULL`
    );
    return result;
  }

  // returns all token UTXOs for the wallet
  function getWalletTokens() {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE token_category IS NOT NULL`
    );
    return result;
  }

  // returns all UTXOs for an address in the wallet
  function getAddressUtxos(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address="${address}"`
    );
    return result;
  }

  // returns all non-token UTXOs for an address in the wallet
  function getAddressCoins(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address="${address}" AND token_category IS NULL`
    );
    return result;
  }

  // returns all token UTXOs for an address in the wallet
  function getAddressTokens(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address="${address}" AND token_category IS NOT NULL`
    );
    return result;
  }

  // attempts to find the best combination of UTXOs to fulfill the amount and fee
  function selectCoins(amount, fee) {
    Log.debug("selectCoins", amount, fee);
    const targetAmount = new Decimal(amount).plus(fee).toNumber();

    // get all available UTXOs (without tokens)
    const availableCoins = walletDb.exec(
      `SELECT * FROM address_utxos 
          WHERE token_category IS NULL
          ORDER BY amount DESC`
    );

    const availableCoinSum = availableCoins.reduce(
      (sum, utxo) => sum + utxo.amount,
      0
    );

    /*Log.debug(
      "selectCoins availableCoins",
      availableCoinSum,
      availableCoins.length
    );*/

    // check if we have enough balance across all UTXOs
    // empty set = insufficient funds
    if (availableCoinSum < targetAmount) {
      return [];
    }

    // 1. if there's an exact UTXO, use that UTXO and its address-mates
    const exactCoins = availableCoins.filter(
      (utxo) => utxo.amount === targetAmount
    );
    if (exactCoins.length > 0) {
      Log.debug("selectCoins exactCoin", exactCoins[0].address);
      // spend all utxos on this address (for privacy)
      return getAddressCoins(exactCoins[0].address);
    }

    // all full address balances >= amount are eligible
    const eligibleAddresses = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE 
            balance >= ${targetAmount}
          ORDER BY balance ASC`
    );

    /*Log.debug(
      "selectCoins eligibleAddresses",
      eligibleAddresses.map((a) => a.address)
    );*/

    // 2. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === targetAmount
    );
    if (exactAddresses.length > 0) {
      Log.debug("selectCoins exactAddress", exactAddresses[0].address);
      return getAddressCoins(exactAddresses[0].address);
    }

    // try to consolidate small UTXOs to make the targetAmount
    // all UTXOs <= targetAmount are eligible to be consolidated
    const consolidateCoins = walletDb.exec(
      `SELECT * FROM address_utxos 
          WHERE 
            amount <= ${targetAmount} 
            AND token_category IS NULL
          ORDER BY amount DESC`
    );

    const eligibleCoins = {
      consolidated: targetUtxos(consolidateCoins, targetAmount, fee),

      available: targetUtxos(availableCoins, targetAmount, fee),
      // 0th-index eligible address is smallest with balance >= targetAmount
      address:
        eligibleAddresses.length > 0
          ? targetUtxos(
              getAddressCoins(eligibleAddresses[0].address),
              targetAmount,
              fee
            )
          : null,
    };

    Log.debug("eligibleCoins:", eligibleCoins);

    // this should be impossible, but makes typescript happy. insufficient funds case
    if (eligibleCoins.available === null) {
      return [];
    }

    // check if it's cheaper to spend consolidated utxos, summed utxos, or eligible addresses
    if (eligibleCoins.consolidated !== null) {
      // case: address is cheaper than consolidation
      if (
        eligibleCoins.address !== null &&
        eligibleCoins.address.feeAmount < eligibleCoins.consolidated.feeAmount
      ) {
        Log.debug(
          "selectCoins: spending first-eligible address is cheaper than consolidation",
          eligibleCoins.address.selection
        );
        return eligibleCoins.address.selection;
      }

      if (
        eligibleCoins.consolidated.feeAmount < eligibleCoins.available.feeAmount
      ) {
        Log.debug(
          "selectCoins: spending consolidated UTXOs is cheaper than spending large UTXOs",
          eligibleCoins.consolidated.selection
        );
        return eligibleCoins.consolidated.selection;
      }
    }

    Log.debug(
      "selectCoins spending from all available UTXOs",
      eligibleCoins.available.selection
    );
    return eligibleCoins.available.selection;
  }

  function targetUtxos(utxos, targetAmount, fee) {
    Log.log("targetUtxos trying", utxos, targetAmount, fee);
    const utxoSum = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
    if (utxoSum < targetAmount) {
      return null;
    }

    // try to find the smallest combination of UTXOs (fewer UTXOS moving is better for privacy)
    const selection = [];
    let remainingAmount = targetAmount;

    while (remainingAmount > 0 && utxos.length > 0) {
      const utxo = utxos.shift();
      selection.push(utxo);
      remainingAmount -= utxo.amount;
    }

    // negative remainingAmount is change that needs to be returned to wallet
    const changeAmount = remainingAmount * -1 - fee;

    // if remaining change is under dust limit, add it to fee instead
    const feeAmount = changeAmount < DUST_LIMIT ? fee + changeAmount : fee;

    Log.debug("targetUtxos", selection);
    return { selection, changeAmount, feeAmount };
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
