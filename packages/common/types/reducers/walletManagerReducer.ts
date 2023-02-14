import { SeleneWalletType } from "..";

export interface WalletManagerState {
  activeWalletName: string;
  navigatedWalletName: string;
  wallets: SeleneWalletType[];
  scratchPad: SeleneWalletType;
}
