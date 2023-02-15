import { useEffect, useState } from "react";
import WalletService from "../services/WalletService";

// useWallet hook exposes WalletService API to React components
function useWallet(wallet_name) {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const W = new WalletService();

    let w = W.loadWallet("Selene Default");

    if (w === null) {
      w = W.createWallet();
      console.log("initWallet create");
    }

    setWallet({ ...w, ...W });
  }, []);

  return wallet;
}

export default useWallet;
