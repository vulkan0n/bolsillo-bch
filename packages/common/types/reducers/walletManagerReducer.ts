import { SeleneWalletType } from "..";

export interface WalletManagerState {
  activeWalletName: string;
  navigatedWalletName: string;
  wallets: SeleneWalletType[];
  scratchPad: {
    name?: string;
    description?: string;
    mnemonic?: string;
    derivationPath?: string;
    cashaddr?: string;
  };
}
