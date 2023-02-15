import { useEffect, useState } from "react";
import WalletService from "../services/WalletService";

// useWallet hook exposes WalletService API to React components
function useWallet(wallet_name) {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const initWallet = async () => {
      const W = new WalletService();

      let w = await W.loadWallet("Selene Default");

      if (w === null) {
        w = await W.createWallet();
        console.log("initWallet create", w);
      }

      console.log("initWallet", w);
      return w;
    };

    const w = initWallet();
    setWallet(w);
  }, []);

  return wallet;
}

export default useWallet;
