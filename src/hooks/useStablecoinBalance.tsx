import { useMemo } from "react";
import { useSelector } from "react-redux";
import Decimal from "decimal.js";
import { selectActiveWalletBalance } from "@/redux/wallet";
import UtxoManagerService from "@/services/UtxoManagerService";
import CurrencyService from "@/services/CurrencyService";
import { MUSD_TOKENID } from "@/util/tokens";

export function useStablecoinBalance(walletHash) {
  const UtxoManager = UtxoManagerService(walletHash);
  const stablecoinUtxos = UtxoManager.getCategoryUtxos(MUSD_TOKENID);

  const stablecoinBalance = useMemo(
    () => stablecoinUtxos.reduce((sum, cur) => sum + cur.token_amount, 0n),
    [stablecoinUtxos]
  );

  const spendable_balance = useSelector(selectActiveWalletBalance);

  const Currency = CurrencyService("USD");
  const volatileBalance = BigInt(
    new Decimal(Currency.satsToFiat(spendable_balance))
      .mul(100)
      .round()
      .toString()
  );

  return { stablecoinBalance, volatileBalance };
}
