/* eslint-disable max-classes-per-file */
import Logger from "js-logger";
import { sha256, swapEndianness } from "@bitauth/libauth";
import { Filesystem, Directory, WriteFileResult } from "@capacitor/filesystem";
import DatabaseService from "@/services/DatabaseService";
import { hexToBin, binToHex } from "@/util/hex";

export class BlockNotExistsError extends Error {
  constructor(id: string | number) {
    super(`No Block with id ${id}`);
  }
}

export class ChaintipNotExistsError extends Error {
  constructor() {
    super(`No Chaintip?`);
  }
}

export interface BlockEntity {
  blockhash: string;
  height: number;
  header: string;
}

// BlockchainService: brokers interactions with the block data
export default function BlockchainService() {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    registerBlock,
    getBlocks,
    getBlockByHash,
    getBlockByHeight,
    getChaintip,
    calculateBlockhash,
    decodeBlockHeader,
    verifyMerkleProof,
    purgeBlocks,
  };

  // --------------------------------

  // Raw block data is stored directly on the device filesystem
  // This helps prevent bloating the in-memory sqlite db and causing OOM errors

  // [private] _loadBlockData: read raw block hex data from filesystem
  async function _loadBlockData(blockhash: string): Promise<string> {
    try {
      const blockFile = await Filesystem.readFile({
        path: `/selene/blocks/${blockhash}.raw`,
        directory: Directory.Library,
      });

      const blockData = blockFile.data.toString();

      if (blockData === "") {
        throw new BlockNotExistsError(blockhash);
      }

      // Filesystem plugin gives us base64-encoded data
      const tx_hex = atob(blockData);
      return tx_hex;
    } catch (e) {
      throw new BlockNotExistsError(blockhash);
    }
  }

  // [private] _writeBlockData: write raw transaction hex data to filesystem
  async function _writeBlockData(
    blockhash: string,
    header: string
  ): Promise<WriteFileResult> {
    try {
      // Filesystem plugin writes as raw bytes, but we must pass base64
      const data = btoa(header);

      const result = await Filesystem.writeFile({
        path: `/selene/blocks/${blockhash}.raw`,
        directory: Directory.Library,
        recursive: true,
        data,
      });

      return result;
    } catch (e) {
      Logger.error(e);
      return { uri: "" };
    }
  }

  // registerBlock: insert a block into the database
  async function registerBlock(block) {
    const blockhash = calculateBlockhash(block.header);

    db.run(
      `INSERT INTO blockchain (
        blockhash,
        height
      ) VALUES (
        "${blockhash}",
        "${block.height}"
      ) ON CONFLICT DO 
        UPDATE SET
          height="${block.height}";
      `
    );

    await _writeBlockData(blockhash, block.header);
    saveDatabase();
  }

  // getBlocks: return all known blocks
  function getBlocks(): Array<BlockEntity> {
    const result = resultToJson(db.exec(`SELECT * FROM blockchain;`));
    //Logger.log("getBlocks", result);
    return result;
  }

  // getBlockByHash: get block from database by blockhash
  async function getBlockByHash(blockhash): Promise<BlockEntity> {
    const result = resultToJson(
      db.exec(`SELECT * FROM blockchain WHERE blockhash="${blockhash}";`)
    );

    if (result.length < 1) {
      throw new BlockNotExistsError(blockhash);
    }

    result.header = await _loadBlockData(result.blockhash);

    Logger.debug("getBlockByHash", result, height);
    return result[0];
  }

  // getBlockByHeight: get block from database by height
  async function getBlockByHeight(height): Promise<BlockEntity> {
    const result = resultToJson(
      db.exec(`SELECT * FROM blockchain WHERE height="${height}";`)
    );

    if (result.length < 1) {
      throw new BlockNotExistsError(height);
    }

    result.header = await _loadBlockData(result.blockhash);

    Logger.debug("getBlockByHeight", result, height);
    return result[0];
  }

  async function getChaintip() {
    const result = resultToJson(
      db.exec(`SELECT * FROM blockchain ORDER BY height DESC LIMIT 1`)
    );

    if (result.length < 1) {
      throw new ChaintipNotExistsError();
    }

    result.header = await _loadBlockData(result.blockhash);

    return result[0];
  }

  // calculateBlockHash: get the sha256 hash of the block header (little-endian)
  function calculateBlockhash(header) {
    const blockhash = swapEndianness(
      binToHex(sha256.hash(sha256.hash(hexToBin(header))))
    );

    return blockhash;
  }

  // decodeBlockHeader: extracts data from raw block header
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function decodeBlockHeader(header) {
    /*
     * version: 4 bytes int
     * prevBlockhash: 32 bytes block hash
     * merkleRoot: 32 bytes merkle root
     * timestamp: 4 bytes int
     * target: 4 bytes
     * nonce: 4 bytes
     */

    return {};
  }

  function verifyMerkleProof(txHash, txIndex, merkleBranch, merkleRoot) {
    //Logger.log("verifyMerkleProof", txHash, txIndex, merkleBranch, merkleRoot);

    let hash = txHash;
    let index = txIndex;

    for (let i = 0; i < merkleBranch.length; i += 1) {
      const branchHash = merkleBranch[i];

      if (index % 2 === 1) {
        hash = sha256.hash(
          Uint8Array.from([...hexToBin(branchHash), ...hexToBin(hash)])
        );
      } else {
        hash = sha256.hash(
          Uint8Array.from([...hexToBin(hash), ...hexToBin(branchHash)])
        );
      }

      index = Math.floor(index / 2);
    }
    return binToHex(hash) === merkleRoot;
  }

  async function deleteBlock(blockhash: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `/selene/blocks/${blockhash}.raw`,
        directory: Directory.Library,
      });
    } catch (e) {
      Logger.warn(e);
    }

    db.run(`DELETE FROM blockchain WHERE blockhash="${blockhash}";`);
    saveDatabase();
    //Logger.debug("deleteBlock", blockhash);
  }

  async function purgeBlocks(): Promise<void> {
    const blockhashes = resultToJson(
      db.exec(
        `
        SELECT blockhash FROM blockchain WHERE
          blockhash NOT IN (SELECT blockhash FROM transactions);
        `
      )
    );

    await Promise.all(
      blockhashes.map(async ({ blockhash }) => deleteBlock(blockhash))
    );
    saveDatabase();
    Logger.debug("purgeBlocks", blockhashes);
  }
}
