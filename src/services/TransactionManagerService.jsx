import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";

import {
  decodeTransaction,
  swapEndianness,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import { hexToBin, binToHex } from "@/util/hex";
import { Decimal } from "decimal.js";

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerTransaction,
    getTransactionByHash,
    resolveTransaction,
  };

  function registerTransaction(tx) {
    db.run(
      `INSERT INTO transactions (
        txid,
        hex,
        size,
        blockhash,
        time,
        blocktime
      )
      VALUES (
        "${tx.txid}",
        "${tx.hex}",
        "${tx.size}",
        "${tx.blockhash}",
        "${tx.time}",
        "${tx.blocktime}"
      ) ON CONFLICT DO 
        UPDATE SET
          hex="${tx.hex}",
          size="${tx.size}",
          blockhash="${tx.blockhash}",
          time="${tx.time}",
          blocktime="${tx.blocktime}"
       WHERE txid="${tx.txid}";`
    );

    db.run(
      `UPDATE address_transactions SET time=${
        tx.time ? `datetime("${tx.time}", "unixepoch")` : "datetime('now')"
      } WHERE txid="${tx.txid}"`
    );

    saveDatabase();
  }

  function getTransactionByHash(tx_hash) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    if (result.length < 1) {
      return null;
    }

    const localTx = result[0];
    const decodedTx = decodeTransaction(hexToBin(localTx.hex));

    // reconstruct "vin" from raw hex
    const vin = decodedTx.inputs.map((input) => ({
      txid: binToHex(input.outpointTransactionHash),
      vout: input.outpointIndex,
    }));

    // reconstruct "vout" from raw hex
    const vout = decodedTx.outputs.map((output, n) => {
      const value = new Decimal(
        `0x${swapEndianness(binToHex(output.satoshis))}`
      ).toNumber();

      return {
        n,
        scriptPubKey: {
          addresses: [
            value > 0
              ? lockingBytecodeToCashAddress(
                  output.lockingBytecode,
                  "bitcoincash"
                )
              : "",
          ],
        },
        value,
      };
    });

    const tx = { ...result[0], vin, vout };

    //console.log("getTransactionByHash", tx_hash, decodedTx, tx);
    return tx;
  }

  async function resolveTransaction(tx_hash) {
    const localTx = getTransactionByHash(tx_hash);

    // if localTx is null we're requesting this tx for the first time
    if (localTx === null || localTx.blockhash === null) {
      const Electrum = new ElectrumService();
      const tx = await Electrum.requestTransaction(tx_hash);
      registerTransaction(tx);
    }

    return getTransactionByHash(tx_hash);
  }
}
