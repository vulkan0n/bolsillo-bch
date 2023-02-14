import { createContext, useContext } from "react";
import { Wallet, TestNetWallet } from "mainnet-js";

const WalletContext = createContext({
  satoshis: 174634,
});

export function WalletProvider({ children }) {
  const wallet = useContext(WalletContext);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const wallet = useContext(WalletContext);
  return wallet;
}
