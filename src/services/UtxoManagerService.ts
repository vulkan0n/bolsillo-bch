import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";

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
    getCategoryUtxos,
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
    const result = walletDb.exec(
      `SELECT * FROM address_utxos`,
      null,
      {
        useBigInt: true,
      }
    );
    Log.debug(result);
    return result;
  }

  // returns all non-token UTXOs for the wallet
  function getWalletCoins() {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE token_category IS NULL`,
      null,
      { useBigInt: true }
    );
    return result;
  }

  // returns all token UTXOs for the wallet
  function getWalletTokens() {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE token_category IS NOT NULL`,
      null,
      { useBigInt: true }
    );
    return result;
  }

  // returns all UTXOs for an address in the wallet
  function getAddressUtxos(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address=? ORDER BY amount ASC`,
      [address],
      { useBigInt: true }
    );
    return result;
  }

  // returns all non-token UTXOs for an address in the wallet
  function getAddressCoins(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address=? AND token_category IS NULL ORDER BY amount ASC`,
      [address],
      { useBigInt: true }
    );
    return result;
  }

  // returns all token UTXOs for an address in the wallet
  function getAddressTokens(address) {
    const result = walletDb.exec(
      `SELECT * FROM address_utxos WHERE address=? AND token_category IS NOT NULL ORDER BY amount ASC `,
      [address],
      { useBigInt: true }
    );
    return result;
  }

  function getCategoryUtxos(category: string) {
    const result = walletDb.exec(
      "SELECT * FROM address_utxos WHERE token_category=?",
      [category],
      { useBigInt: true }
    );

    return result;
  }

  // attempts to find the best combination of UTXOs to fulfill the amount and fee
  function selectCoins(amount: bigint) {
    Log.debug("selectCoins", amount);
    const targetAmount = amount;

    // get all available UTXOs (without tokens)
    const availableCoins = getWalletCoins();

    const availableCoinSum = availableCoins.reduce(
      (sum, utxo) => sum + utxo.amount,
      0n
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
            balance >= ?
          ORDER BY balance ASC`,
      [targetAmount.toString()]
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

    const eligibleCoins = {
      available: targetUtxos(availableCoins, targetAmount),
      // 0th-index eligible address is smallest with balance >= targetAmount
      address:
        eligibleAddresses.length > 0
          ? targetUtxos(
              getAddressCoins(eligibleAddresses[0].address),
              targetAmount
            )
          : null,
    };

    Log.debug("eligibleCoins:", eligibleCoins);

    // this should be impossible, but makes typescript happy. insufficient funds case
    if (eligibleCoins.available === null) {
      return [];
    }

    // check if it's cheaper to spend consolidated utxos or eligible addresses
    // case: address is cheaper than consolidation
    if (
      eligibleCoins.address !== null &&
      eligibleCoins.address.changeAmount > eligibleCoins.available.changeAmount
    ) {
      Log.debug(
        "selectCoins: spending first-eligible address is cheaper than consolidation",
        eligibleCoins.address.selection
      );
      return eligibleCoins.address.selection;
    }

    Log.debug(
      "selectCoins spending from all available UTXOs",
      eligibleCoins.available.selection
    );
    return eligibleCoins.available.selection;
  }

  function targetUtxos(utxos, targetAmount) {
    Log.log("targetUtxos trying", utxos, targetAmount);
    const utxoSum = utxos.reduce((sum, utxo) => sum + utxo.amount, 0n);
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
    const changeAmount = remainingAmount * -1n;

    Log.debug("targetUtxos", selection);
    return { selection, changeAmount };
  }

  function discardUtxo(utxo) {
    walletDb.run(`DELETE FROM address_utxos WHERE txid=? AND tx_pos=?;`, [
      utxo.tx_hash,
      utxo.tx_pos,
    ]);
  }

  function discardAddressUtxos(address) {
    walletDb.run(`DELETE FROM address_utxos WHERE address=?;`, [address]);
  }
}
