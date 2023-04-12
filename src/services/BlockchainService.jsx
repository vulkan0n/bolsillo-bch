import DatabaseService from "@/services/DatabaseService";

export default function BlockchainService() {
  return {
    registerBlock,
  };

  function registerGenesis() {
    const genesis = {
      blockhash:
        "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      header: "",
      version: 1,
      prevblockhash:
        "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      merkleroot:
        "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
      time: 1231006505,
      height: 0,
      bits: "1d00ffff",
      nonce: 2083236893,
    };

    registerBlock(genesis);
  }

  function registerBlock(block) {
    console.log("registerBlock", block);

    db.run(
      `INSERT INTO blockchain (
        blockhash
        height
        header
      ) VALUES (
        "${block.blockhash}",
        "${block.height}",
        "${block.header}",
      )`
    );
  }
}

/*
 * version: 4 bytes int
 * prevhash: 32 bytes block hash
 * merkleroot: 32 bytes merkle root
 * timestamp: 4 bytes int
 * target: 4 bytes
 * nonce: 4 bytes
*/
