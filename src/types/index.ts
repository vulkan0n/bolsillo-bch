import { ExchangeRatesState } from "../redux/reducers/exchangeRatesReducer";
import { SettingsState } from "../redux/reducers/settingsReducer";
import { TransactionPadState } from "../redux/reducers/transactionPadReducer";

export interface ReduxState {
  transactionPad: TransactionPadState;
  exchangeRates: ExchangeRatesState;
  settings: SettingsState;
}

export interface WalletType {
  mnemonic: string;
  derivationPath: string;
}
