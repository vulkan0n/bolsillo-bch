import { SettingsState } from "../redux/reducers/settingsReducer";
import { TransactionPadState } from "../redux/reducers/transactionPadReducer";

export interface ReduxState {
  transactionPad: TransactionPadState;
  settings: SettingsState;
}

export interface WalletType {
  mnemonic: string;
  derivativePath: string;
}
