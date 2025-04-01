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
    getCategoryUtxos,
    selectCoins,
    selectTokens,
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
    const result = walletDb.exec(`SELECT * FROM address_utxos`, null, {
      useBigInt: true,
    });
    //Log.debug(result);
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
      `SELECT * FROM address_utxos WHERE token_category IS NOT NULL ORDER BY token_category ASC`,
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

  function getCategoryUtxos(category: string) {
    const result = walletDb.exec(
      "SELECT * FROM address_utxos WHERE token_category=? ORDER BY token_amount DESC",
      [category],
      { useBigInt: true }
    );

    return result;
  }

  function selectTokens(category: string, amount: bigint) {
    Log.debug("selectTokens", category, amount);
    const targetAmount = amount;

    const tokenUtxos = getCategoryUtxos(category);
    const availableTokenSum = tokenUtxos.reduce(
      (sum, cur) => sum + cur.token_amount,
      0n
    );

    if (availableTokenSum < targetAmount) {
      return [];
    }

    const thresholdUtxo = tokenUtxos
      .filter((u) => u.token_amount >= targetAmount)
      .pop();

    if (thresholdUtxo) {
      return [thresholdUtxo];
    }

    let remainingAmount = targetAmount;
    const consumedUtxos = [];
    while (remainingAmount > 0) {
      const utxo = tokenUtxos.shift();

      // insufficient tokens
      if (!utxo) {
        return [];
      }

      if (!utxo.token) {
        Log.warn(utxo);
      }

      consumedUtxos.push(utxo);
      remainingAmount -= utxo.token_amount;
    }

    return consumedUtxos;
  }

  // attempts to find the best combination of UTXOs to fulfill the amount and fee
  function selectCoins(amount: bigint) {
    Log.debug("selectCoins", amount);
    const targetAmount = amount;

    // get all available UTXOs (without tokens)
    const allAvailableCoins = getWalletCoins();

    const availableCoinSum = allAvailableCoins.reduce(
      (sum, utxo) => sum + utxo.amount,
      0n
    );

    // check if we have enough balance across all UTXOs
    // empty set = insufficient funds
    if (availableCoinSum < targetAmount) {
      return [];
    }

    // 1. if there's an exact UTXO, use that UTXO *and* its address-mates (for privacy)
    const exactCoins = allAvailableCoins.filter(
      (utxo) => utxo.amount === targetAmount
    );
    if (exactCoins.length > 0) {
      Log.debug("selectCoins exactCoin", exactCoins[0].address);
      // spend all utxos on this address for privacy
      return getAddressCoins(exactCoins[0].address);
    }

    // consider all addresses with balance >= amount
    // in ASCENDING order so smallest address over threshold is first (for privacy)
    const eligibleAddresses = walletDb.exec(
      `SELECT * FROM addresses 
          WHERE 
            balance >= ?
          ORDER BY balance ASC`,
      [targetAmount.toString()]
    );

    // 2. if there's a whole address balance that's exact, spend the entire address
    const exactAddresses = eligibleAddresses.filter(
      (address) => address.balance === targetAmount
    );
    if (exactAddresses.length > 0) {
      Log.debug("selectCoins exactAddress", exactAddresses[0].address);
      return getAddressCoins(exactAddresses[0].address);
    }

    // 3. select from all available UTXOs
    const eligibleCoins = {
      available: targetUtxos(allAvailableCoins, targetAmount),
      // 0th-index eligible address is smallest with balance >= targetAmount
      address: targetUtxos(
        getAddressCoins(eligibleAddresses[0].address),
        targetAmount
      ),
    };

    Log.debug("eligibleCoins:", eligibleCoins);

    if (
      eligibleCoins.address.selection.length > 0 &&
      eligibleCoins.address.selection.length <
        eligibleCoins.available.selection.length
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
      return { selection: [] };
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
