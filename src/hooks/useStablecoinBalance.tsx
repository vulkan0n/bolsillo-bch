import { useMemo } from "react";
import UtxoManagerService from "@/services/UtxoManagerService";
import { MUSD_TOKENID } from "@/util/tokens";

export function useStablecoinBalance(walletHash) {
  const UtxoManager = UtxoManagerService(walletHash);
  const stablecoinUtxos = UtxoManager.getCategoryUtxos(MUSD_TOKENID);

  const stablecoinBalance = useMemo(
    () => stablecoinUtxos.reduce((sum, cur) => sum + cur.token_amount, 0n),
    [stablecoinUtxos]
  );

  return stablecoinBalance;
}
