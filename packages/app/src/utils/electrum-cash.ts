import { ElectrumClient } from "electrum-cash-react-native";

const loadElectrumCash = async () => {
  const electrum = new ElectrumClient(
    "Electrum client example",
    "1.4.1",
    "bch.imaginary.cash"
  );

  try {
    const connection = await electrum.connect();
    console.log({ connection });
  } catch (e) {
    console.log("shits fucked");
    console.log({ e });
  }

  // Declare an example transaction ID.
  const transactionID =
    "4db095f34d632a4daf942142c291f1f2abb5ba2e1ccac919d85bdc2f671fb251";

  // Request the full transaction hex for the transaction ID.
  const transactionHex = await electrum.request(
    "blockchain.transaction.get",
    transactionID
  );

  // Print out the transaction hex.
  console.log("got this transaction hex!!");
  console.log(transactionHex);
};

export default loadElectrumCash;
