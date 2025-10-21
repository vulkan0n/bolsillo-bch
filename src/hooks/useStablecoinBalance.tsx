import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectActiveWalletBalance } from "@/redux/wallet";
import UtxoManagerService from "@/services/UtxoManagerService";
import CauldronService from "@/services/CauldronService";
import { MUSD_TOKENID } from "@/util/tokens";

export function useStablecoinBalance(walletHash) {
  const UtxoManager = UtxoManagerService(walletHash);
  const stablecoinUtxos = UtxoManager.getCategoryUtxos(MUSD_TOKENID);

  const [stablecoinPrice, setStablecoinPrice] = useState(1n);

  const Cauldron = useMemo(() => CauldronService(), []);

  const subscriptionHandler = useCallback(
    () => setStablecoinPrice(Cauldron.getTokenPrice(MUSD_TOKENID)),
    [Cauldron]
  );

  useEffect(
    function cauldronSubscribe() {
      const subscribe = async () => {
        if (!Cauldron.getIsConnected()) {
          await Cauldron.connect();
        }

        Cauldron.subscribe(MUSD_TOKENID, subscriptionHandler);
      };

      subscribe();

      return () => {
        Cauldron.removeHandler(MUSD_TOKENID, subscriptionHandler);
      };
    },
    [Cauldron, subscriptionHandler]
  );

  const stablecoinBalance = useMemo(
    () => stablecoinUtxos.reduce((sum, cur) => sum + cur.token_amount, 0n),
    [stablecoinUtxos]
  );

  const { spendable_balance } = useSelector(selectActiveWalletBalance);

  const volatileBalance = spendable_balance / stablecoinPrice;

  return { stablecoinBalance, volatileBalance };
}
