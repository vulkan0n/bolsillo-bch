import { BridgeState } from "../redux/reducers/bridgeReducer";
import { ExchangeRatesState } from "../redux/reducers/exchangeRatesReducer";
import { SettingsState } from "../redux/reducers/settingsReducer";
import { TransactionPadState } from "../redux/reducers/transactionPadReducer";
import { WalletManagerState } from "../redux/reducers/walletManagerReducer";

export interface ReduxState {
  bridge: BridgeState;
  transactionPad: TransactionPadState;
  exchangeRates: ExchangeRatesState;
  walletManager: WalletManagerState;
  settings: SettingsState;
}

export interface WalletType {
  mnemonic: string;
  derivationPath: string;
  cashAddr: string;
}

export interface SeleneWalletType {
  name: string;
  description: string;
  balance: string;
  mnemonic: string;
  derivationPath: string;
  cashAddr: string;
}

export interface EmitEvent {
  type: string;
  data: {};
}
