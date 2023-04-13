import DatabaseService from "@/services/DatabaseService";
import { crypto } from "@/util/crypto";
import { hexToBin, binToHex } from "@/util/hex";

/*
 * version: 4 bytes int
 * prevBlockhash: 32 bytes block hash
 * merkleRoot: 32 bytes merkle root
 * timestamp: 4 bytes int
 * target: 4 bytes
 * nonce: 4 bytes
 */

// BlockchainService
export default function BlockchainService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerBlock,
    getBlockByHash,
    getBlockByHeight,
    verifyMerkleProof,
  };

  // registerBlock: insert a block into the database
  function registerBlock(block) {
    console.log("registerBlock", block);
    const blockhash = binToHex(
      crypto.sha256.hash(crypto.sha256.hash(hexToBin(block.header)))
    );

    console.log("registerBlock blockhash", blockhash);

    db.run(
      `INSERT OR IGNORE INTO blockchain (
        blockhash,
        height,
        header
      ) VALUES (
        "${blockhash}",
        "${block.height}",
        "${block.header}"
      );`
    );

    db.run(
      `UPDATE blockchain SET
        height="${block.height}",
        header="${block.header}"
       WHERE blockhash="${blockhash}"`
    );
  }

  // getBlockByHash: get block from database by blockhash
  function getBlockByHash(blockhash) {
    const result = resultToJson(
      db.exec(`SELECT * FROM blockchain WHERE blockhash="${blockhash}";`)
    );
    return result.length > 0 ? result[0] : null;
  }

  // getBlockByHeight: get block from database by height
  function getBlockByHeight(height) {
    const result = resultToJson(
      db.exec(`SELECT * FROM blockchain WHERE height="${height}";`)
    );
    return result.length > 0 ? result[0] : null;
  }

  function verifyMerkleProof(txHash, txIndex, merkleBranch, merkleRoot) {
    console.log("verifyMerkleProof", txHash, txIndex, merkleBranch, merkleRoot);

    let hash = txHash;
    let index = txIndex;

    for (let i = 0; i < merkleBranch.length; i++) {
      let branchHash = merkleBranch[i];

      if (index % 2 === 1) {
        hash = crypto.sha256.hash(
          Uint8Array.from([...hexToBin(branchHash), ...hexToBin(hash)])
        );
      } else {
        hash = crypto.sha256.hash(
          Uint8Array.from([...hexToBin(hash), ...hexToBin(branchHash)])
        );
      }

      index = Math.floor(index / 2);
    }
    return binToHex(hash) === merkleRoot;
  }
}
