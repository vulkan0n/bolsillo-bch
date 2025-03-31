import { useSelector } from "react-redux";
import { selectActiveWalletHash } from "@/redux/wallet";

import TokenManagerService from "@/services/TokenManagerService";

export function useTokenData(tokenId: string, withAmounts: boolean = false) {
  const walletHash = useSelector(selectActiveWalletHash);
  const TokenManager = TokenManagerService(walletHash);

  const amounts = withAmounts
    ? TokenManager.calculateTokenAmounts(tokenId)
    : {};

  const tokenData = {
    ...TokenManager.getToken(tokenId),
    ...amounts,
  };

  return tokenData;
}
