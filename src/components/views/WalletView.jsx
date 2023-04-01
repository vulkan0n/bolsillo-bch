import { Outlet } from "react-router-dom";
import WalletViewBalance from "./walletView/WalletViewBalance";
import WalletViewTabs from "./walletView/WalletViewTabs";

function WalletView() {
  return (
    <>
      <WalletViewBalance />
      <WalletViewTabs />
      <Outlet />
    </>
  );
}

/*function useActiveWallet() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  function handleBalanceUpdateEvent(event) {
    setBalance(event.detail);
  }

  useEffect(() => {
    const Wallet = new WalletService();

    const setup = async () => {
      // TODO: get selected wallet ID from preferences
      // TODO: use redux as source of truth for Preferences
      const bootWallet = await Wallet.boot(1);
      const walletBalance = bootWallet.getWalletBalance();

      // TODO: use redux as source of truth for balance...
      document.addEventListener("balanceUpdate", handleBalanceUpdateEvent);

      setWallet(bootWallet);
      setBalance(walletBalance);
    };

    const cleanup = () => {
      document.removeEventListener("balanceUpdate", handleBalanceUpdateEvent);

      if (wallet) {
        Wallet.cleanup(wallet.id);
      }
    };

    setup();
    return cleanup;
  }, []);

  return { wallet, balance };
}*/

export default WalletView;
