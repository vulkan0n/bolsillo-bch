import { ElectrumClient } from "electrum-cash-react-native";

export const electrum = new ElectrumClient(
  "Electrum client example",
  "1.4.1",
  "bch.imaginary.cash"
);

export const loadElectrumCash = async () => {
  await electrum.connect();
};
