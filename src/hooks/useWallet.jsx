import WalletService from "@/services/WalletService";
import ElectrumService from "@/services/ElectrumService";

// "Hot Wallet" consumable by components
function useWallet(name) {
  const wallet = new WalletService().loadWallet(name);
  const electrum = new ElectrumService();

  function getSatoshiBalance() {
    return 133742069;

  }

  function getFreshAddresses() {
    return wallet.getFreshAddresses();
  }

  return {
    getSatoshiBalance,
    getFreshAddresses,
  };
}

export default useWallet;
