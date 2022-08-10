import { SettingsState } from "../redux/reducers/settingsReducer";
import { TransactionPadState } from "../redux/reducers/transactionPadReducer";

export interface ReduxState {
  transactionPad: TransactionPadState;
  settings: SettingsState;
  bchUsdPrice: string;
}

export interface WalletType {
  mnemonic: string;
  derivationPath: string;
}
