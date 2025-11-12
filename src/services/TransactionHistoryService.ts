import { DateTime } from "luxon";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService, {
  TransactionEntity,
} from "@/services/TransactionManagerService";
import CurrencyService from "@/services/CurrencyService";
import TokenManagerService from "@/services/TokenManagerService";
import { binToHex } from "@/util/hex";
import { convertCashAddress } from "@/util/cashaddr";

const Log = LogService("TransactionHistoryService");

class TransactionHistoryNotExistsError extends Error {
  constructor(tx_hash, walletHash) {
    super(`No address_transactions for ${tx_hash} and wallet ${walletHash}`);
  }
}

export interface HistoryEntity {
  txid: string;
  height: number;
  address: string;
  time: number;
  time_seen: string;
  amount: bigint;
  fiat_amount: string;
  fiat_currency: string;
  memo: string;
}

export interface TokenHistoryEntity {
  txid: string;
  category: string;
  fungible_amount: number;
  nft_amount: number;
  symbol: string;
}

export interface MergedHistoryEntity extends HistoryEntity {
  tokens?: Array<TokenHistoryEntity>;
}

export interface TransactionHistoryFilters {
  direction?: "incoming" | "outgoing";
  hasToken?: boolean;
  hasNFT?: boolean;
  sortField?: "date" | "amount" | "address";
  sortDirection?: "asc" | "desc";
}

export interface PaginatedHistoryResult {
  transactions: Array<MergedHistoryEntity>;
  hasMore: boolean;
  total: number;
}

export default function TransactionHistoryService(
  walletHash: string,
  fiatCurrency
) {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const walletDb = Database.getWalletDatabase(walletHash);

  const AddressManager = AddressManagerService(walletHash);
  const myAddresses = [
    ...AddressManager.getReceiveAddresses(),
    ...AddressManager.getChangeAddresses(),
  ].map((a) => a.address);
  myAddresses.push(
    ...myAddresses.map((a) => convertCashAddress(a, "tokenaddr"))
  );

  const TokenManager = TokenManagerService(walletHash);

  return {
    resolveTransactionHistory,
    calculateTxAmount,
    setTransactionMemo,
    getTransactionMemo,
    getTotalTransactionCount,
    searchTransactionHistory,
  };

  function getTransactionHistory(
    start: number = 0,
    limit: number = 20,
    searchQuery: string = "",
    filters: TransactionHistoryFilters | null = null
  ): Array<HistoryEntity> {
    // Build WHERE clause for search
    let searchCondition = "";
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.trim();

      // Try to convert address to different formats for searching
      let addressVariants = [query];
      try {
        // If it's a valid address, add both cashaddr and tokenaddr formats
        const cashAddr = convertCashAddress(query, "cashaddr");
        const tokenAddr = convertCashAddress(query, "tokenaddr");
        addressVariants = [query, cashAddr, tokenAddr];
      } catch (e) {
        // Not a valid address, just use the query as-is
      }

      // Build address search conditions for all variants (exact match)
      const addressConditions = addressVariants
        .map((addr) => `address LIKE '%${addr}%'`)
        .join(" OR ");

      // For address search, we need to search across all addresses in the transaction
      // Create a subquery that finds all txids matching the search
      searchCondition = `AND txid IN (
        SELECT DISTINCT txid FROM address_transactions
        WHERE txid LIKE '%${query}%'
        OR memo LIKE '%${query}%'
        OR ${addressConditions}
      )`;
    }

    // Build filter conditions
    let filterCondition = "";
    if (filters) {
      const conditions: Array<string> = [];

      // Direction filter (incoming/outgoing)
      if (filters.direction === "incoming") {
        conditions.push("amount > 0");
      } else if (filters.direction === "outgoing") {
        conditions.push("amount < 0");
      }

      // Token filter (has tokens / no tokens)
      if (filters.hasToken === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      } else if (filters.hasToken === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      }

      // NFT filter (has NFTs / no NFTs)
      if (filters.hasNFT === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      } else if (filters.hasNFT === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      }

      if (conditions.length > 0) {
        filterCondition = `AND ${conditions.join(" AND ")}`;
      }
    }

    // Build ORDER BY clause
    let orderBy = "";
    if (!filters) {
      // Default ordering - newest first (unconfirmed, then confirmed by height DESC)
      orderBy = `ORDER BY
        (height > 0) ASC,
        (height = -1) DESC,
        height DESC,
        block_pos DESC,
        time DESC,
        time_seen DESC`;
    }

    const sortDir = filters?.sortDirection?.toUpperCase() ?? "DESC";

    const sortStrategies = {
      amount: () => `ORDER BY amount ${sortDir}`,
      address: () => `ORDER BY address ${sortDir}`,
      date: () => {
        const isAscending = filters?.sortDirection === "asc";
        return `ORDER BY
          CASE WHEN height <= 0 THEN ${isAscending ? 1 : 0} ELSE ${isAscending ? 0 : 1} END ASC,
          height ${sortDir},
          block_pos ASC,
          time ${sortDir},
          time_seen ${sortDir}`;
      },
    };

    orderBy = (
      filters?.sortField
        ? sortStrategies[filters.sortField]
        : sortStrategies.date
    )();

    // Get all transactions in a single query with proper sorting
    // We need to handle both confirmed and unconfirmed together for correct sorting
    const address_transactions = walletDb
      .exec(
        `SELECT * FROM address_transactions
          WHERE 1=1 ${searchCondition} ${filterCondition}
          GROUP BY txid
          ${orderBy}
          LIMIT ${limit} OFFSET ${start};
        `
      )
      .map((at) => {
        let txTime = at.time;
        if (at.height <= 0) {
          txTime = DateTime.fromISO(at.time_seen).toSeconds();
        }
        return { ...at, time: txTime };
      });

    return address_transactions;
  }

  function searchTransactionHistory(
    searchQuery: string,
    filters: TransactionHistoryFilters | null = null
  ): number {
    // Count total results matching search query
    if (!searchQuery || searchQuery.trim() === "") {
      return getTotalTransactionCount(filters);
    }

    const query = searchQuery.trim();

    // Try to convert address to different formats for searching
    let addressVariants = [query];
    try {
      // If it's a valid address, add both cashaddr and tokenaddr formats
      const cashAddr = convertCashAddress(query, "cashaddr");
      const tokenAddr = convertCashAddress(query, "tokenaddr");
      addressVariants = [query, cashAddr, tokenAddr];
    } catch (e) {
      // Not a valid address, just use the query as-is
    }

    // Build address search conditions for all variants
    const addressConditions = addressVariants
      .map((addr) => `address LIKE '%${addr}%'`)
      .join(" OR ");

    // Build filter conditions
    let filterCondition = "";
    if (filters) {
      const conditions: Array<string> = [];

      if (filters.direction === "incoming") {
        conditions.push("amount > 0");
      } else if (filters.direction === "outgoing") {
        conditions.push("amount < 0");
      }

      // Token filter (has tokens / no tokens)
      if (filters.hasToken === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      } else if (filters.hasToken === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      }

      // NFT filter (has NFTs / no NFTs)
      if (filters.hasNFT === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      } else if (filters.hasNFT === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      }

      if (conditions.length > 0) {
        filterCondition = `AND ${conditions.join(" AND ")}`;
      }
    }

    const searchCondition = `WHERE txid IN (
      SELECT DISTINCT txid FROM address_transactions
      WHERE txid LIKE '%${query}%'
      OR memo LIKE '%${query}%'
      OR ${addressConditions}
    )`;

    const confirmedCount =
      walletDb.exec(
        `SELECT COUNT(DISTINCT txid) as count FROM address_transactions
         ${searchCondition} ${filterCondition} AND height > 0;`
      )[0]?.count || 0;

    const unconfirmedCount =
      walletDb.exec(
        `SELECT COUNT(DISTINCT txid) as count FROM address_transactions
         ${searchCondition} ${filterCondition} AND height <= 0;`
      )[0]?.count || 0;

    return confirmedCount + unconfirmedCount;
  }

  function mergeTokenHistory(
    address_transactions: Array<HistoryEntity>
  ): MergedHistoryEntity {
    const tx_hashes = address_transactions.map((at) => at.txid);
    const joinedTxHashes = tx_hashes.map((txid) => `"${txid}"`).join(",");

    // get token amounts for each historical transaction
    const tokenTransactions: Array<TokenHistoryEntity> = walletDb.exec(
      `SELECT * FROM token_transactions WHERE txid IN (${joinedTxHashes});`
    );

    // for each historical transaction, merge in the token data
    const mergedTransactions = address_transactions.reduce((merged, atx) => {
      // from all token transactions, get the ones for this atx
      const tokenTxes = tokenTransactions.filter(
        (ttx) => ttx.txid === atx.txid
      );

      // get a list of categories for our atx's token transactions
      const categories = tokenTxes.map((ttx) => ttx.category);

      const tokens = categories.flatMap((category) => {
        const token = TokenManager.getToken(category);
        const txes = tokenTxes
          .filter((ttx) => ttx.category === category)
          .map((tx) => ({
            ...token,
            ...tx,
          }));

        return txes;
      });

      if (tokenTxes.length > 0) {
        return [
          ...merged,
          {
            ...atx,
            tokens,
          },
        ];
      }

      return [...merged, atx];
    }, [] as Array<MergedHistoryEntity>);

    //Log.debug("mergedTransactions", mergedTransactions);
    return mergedTransactions;
  }

  async function resolveTransactionHistory(
    start: number = 0,
    limit: number = 20,
    searchQuery: string = "",
    filters: TransactionHistoryFilters | null = null
  ): Promise<PaginatedHistoryResult> {
    //Log.debug("resolveTransactionHistory");
    const total = searchQuery
      ? searchTransactionHistory(searchQuery, filters)
      : getTotalTransactionCount(filters);
    const address_transactions = getTransactionHistory(
      start,
      limit,
      searchQuery,
      filters
    );
    const mergedHistory = mergeTokenHistory(address_transactions);

    const hasMore = start + limit < total;

    if (!ElectrumService().getIsConnected()) {
      return {
        transactions: mergedHistory,
        hasMore,
        total,
      };
    }

    // resolve amounts for transactions that don't have them
    const tx_hashes = address_transactions.map((at) => at.txid);
    Log.debug("resolveTransactionHistory awaiting", tx_hashes.length);
    const txHistory = (
      await Promise.all(
        tx_hashes.map(async (tx_hash) => {
          try {
            const tx = await resolveTransactionAmount(tx_hash);
            return tx;
          } catch (e) {
            await TransactionManagerService().deleteTransaction(tx_hash);
            return null;
          }
        })
      )
    ).filter((tx) => tx !== null);

    return {
      transactions: txHistory,
      hasMore,
      total,
    };
  }

  async function resolveTransactionAmount(tx_hash) {
    try {
      const addressTx = getAddressTransaction(tx_hash);

      if (addressTx.amount === null || addressTx.amount === 0) {
        throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
      }

      if (addressTx.height <= 0) {
        throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
      }

      const tokenTxes = walletDb.exec(
        `SELECT * FROM token_transactions WHERE txid=?;`,
        [tx_hash]
      );

      const categories = tokenTxes.map((ttx) => ttx.category);

      const tokens = categories.map((category) => ({
        ...TokenManager.getToken(category),
        ...tokenTxes.find((ttx) => ttx.category === category),
      }));

      if (tokenTxes.length > 0) {
        return { ...addressTx, tokens };
      }

      return addressTx;
    } catch (e) {
      const tx = await TransactionManagerService().resolveTransaction(tx_hash);
      const { amount, tokens } = await calculateTxAmount(tx);
      const updatedAddressTx = updateTxAmount(tx.txid, amount);
      await TokenManager.registerTokenHistory(tx.txid, tokens);
      return { ...updatedAddressTx, tokens };
    }
  }

  async function calculateTxAmount(tx: TransactionEntity) {
    const TransactionManager = TransactionManagerService();

    const isMyUtxo = (utxo) => {
      if (utxo.scriptPubKey.asm.startsWith("OP_RETURN")) {
        // OP_RETURN
        return false;
      }

      const isMine =
        utxo.scriptPubKey.addresses.findIndex((address) => {
          return myAddresses.includes(address);
        }) > -1;

      return isMine;
    };

    // de-duplicate requested transaction ids
    const vinTxHashes = tx.vin
      .map((vin) => vin.txid)
      .reduce(
        (txes, txid) =>
          !txes.find((t) => t === txid) ? [...txes, txid] : txes,
        [] as Array<string>
      );

    // resolve vins to real txos
    const vinTxes = await Promise.all(
      vinTxHashes.map((txid) => TransactionManager.resolveTransaction(txid))
    );

    // for each input tx, get outputs.
    // for each output, include in result if vin and out match
    const vinOuts = vinTxes
      .map((t) =>
        t.vout.filter(
          (out) =>
            tx.vin.findIndex(
              (vin) => vin.txid === t.txid && vin.vout === out.n
            ) > -1
        )
      )
      .flat();

    // any inputs that belong to us are outgoing money
    const myInputs = vinOuts.filter((out) => isMyUtxo(out));

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((out) => isMyUtxo(out));

    // sum reducer function
    const amountReducer = (sum, cur) => sum + cur.valueSatoshis;
    const tokenReducer = (tokens, cur) => {
      const result = tokens;

      if (!cur.token) {
        return result;
      }

      const category = binToHex(cur.token.category);

      if (!result[category]) {
        result[category] = {
          amount: 0n,
          nftAmount: 0,
        };
      }

      result[category].amount = tokens[category].amount + cur.token.amount;

      result[category].nftAmount = cur.token.nft
        ? tokens[category].nftAmount + 1
        : 0;

      return result;
    };

    const receivedAmount: bigint = myOutputs.reduce(amountReducer, 0n);
    const sentAmount: bigint = myInputs.reduce(amountReducer, 0n);

    const receivedTokens = myOutputs.reduce(tokenReducer, {});
    const sentTokens = myInputs.reduce(tokenReducer, {});

    // TODO: totalOutput - amount = fee
    const amount = Number(receivedAmount - sentAmount);

    // get token counts
    // `Set` automatically de-duplicate entries by enforcing uniqueness
    const uniqueCategories: Array<string> = [
      ...new Set([...Object.keys(receivedTokens), ...Object.keys(sentTokens)]),
    ];

    const tokens = uniqueCategories.map((category) => {
      if (!receivedTokens[category]) {
        receivedTokens[category] = {
          amount: 0n,
          nftAmount: 0,
        };
      }

      if (!sentTokens[category]) {
        sentTokens[category] = {
          amount: 0n,
          nftAmount: 0,
        };
      }

      const { amount: receivedTokenAmount, nftAmount: receivedNftAmount } =
        receivedTokens[category];
      const { amount: sentTokenAmount, nftAmount: sentNftAmount } =
        sentTokens[category];

      return {
        category,
        amount: (receivedTokenAmount - sentTokenAmount).toString(),
        nftAmount: receivedNftAmount - sentNftAmount,
      };
    });

    return { amount, tokens };
  }

  function setTransactionMemo(tx_hash: string, memo: string): void {
    walletDb.run("UPDATE address_transactions SET memo=? WHERE txid=?;", [
      memo,
      tx_hash,
    ]);

    walletDb.run("UPDATE address_utxos SET memo=? WHERE txid=?;", [
      memo,
      tx_hash,
    ]);

    Database.flushDatabase(walletHash);
  }

  function getTransactionMemo(tx_hash: string): string {
    const result = walletDb.exec(
      "SELECT memo FROM address_transactions WHERE txid=?;",
      [tx_hash]
    );

    const memo = result.length > 0 ? result[0].memo : "";
    return memo;
  }

  function updateTxAmount(tx_hash: string, amount: number) {
    //Log.debug("updateTxAmount", tx_hash);
    const fiat_amount = CurrencyService(fiatCurrency).satsToFiat(amount);

    const tx = APP_DB.exec(
      "SELECT time, height FROM transactions WHERE txid=?;",
      [tx_hash]
    )[0];

    const result = walletDb.exec(
      `UPDATE address_transactions SET
          amount=?,
          fiat_amount=?,
          fiat_currency=?,
          time=?,
          height=?
        WHERE txid=?
        RETURNING *;`,
      [amount, fiat_amount, fiatCurrency, tx.time, tx.height, tx_hash]
    )[0];
    //Log.debug("updateTxAmount", tx_hash, result);

    return result;
  }

  function getAddressTransaction(tx_hash: string) {
    const result = walletDb.exec(
      "SELECT * FROM address_transactions WHERE txid=?;",
      [tx_hash]
    );

    if (result.length === 0) {
      throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
    }

    return result[0];
  }

  function getTotalTransactionCount(
    filters: TransactionHistoryFilters | null = null
  ): number {
    // Build filter conditions
    let filterCondition = "";
    if (filters) {
      const conditions: Array<string> = [];

      if (filters.direction === "incoming") {
        conditions.push("amount > 0");
      } else if (filters.direction === "outgoing") {
        conditions.push("amount < 0");
      }

      // Token filter (has tokens / no tokens)
      if (filters.hasToken === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      } else if (filters.hasToken === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions)"
        );
      }

      // NFT filter (has NFTs / no NFTs)
      if (filters.hasNFT === true) {
        conditions.push(
          "txid IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      } else if (filters.hasNFT === false) {
        conditions.push(
          "txid NOT IN (SELECT DISTINCT txid FROM token_transactions WHERE nft_amount > 0)"
        );
      }

      if (conditions.length > 0) {
        filterCondition = `AND ${conditions.join(" AND ")}`;
      }
    }

    const confirmedCount =
      walletDb.exec(
        `SELECT COUNT(DISTINCT txid) as count FROM address_transactions WHERE height > 0 ${filterCondition};`
      )[0]?.count || 0;

    const unconfirmedCount =
      walletDb.exec(
        `SELECT COUNT(DISTINCT txid) as count FROM address_transactions WHERE height <= 0 ${filterCondition};`
      )[0]?.count || 0;

    return confirmedCount + unconfirmedCount;
  }
}
