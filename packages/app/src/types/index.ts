import { ExchangeRatesState } from "@selene/app/src/redux/reducers/exchangeRatesReducer";
import { SettingsState } from "@selene/app/src/redux/reducers/settingsReducer";
import { TransactionPadState } from "@selene/app/src/redux/reducers/transactionPadReducer";
import { WalletManagerState } from "@selene/app/src/redux/reducers/walletManagerReducer";
import { LocalState } from "@selene/app/src/redux/reducers/localReducer";

export interface ReduxState {
  transactionPad: TransactionPadState;
  exchangeRates: ExchangeRatesState;
  walletManager: WalletManagerState;
  settings: SettingsState;
  local: LocalState;
}

export interface WalletType {
  mnemonic: string;
  derivationPath: string;
  cashaddr: string;
}

export interface TransactionType {
  txn: string;
  blockheight?: number;
  note?: string;
}

export interface SeleneWalletType {
  name: string;
  description: string;
  balance: string;
  mnemonic: string;
  derivationPath: string;
  cashaddr: string;
  transactions: TransactionType[];
}

export interface EmitEvent {
  type: string;
  data: {};
}

export type BitcoinDenominationTypes =
  | "bitcoins"
  | "millibits"
  | "bits"
  | "satoshis";

export type SupportedCurrencyTypes =
  | "aud"
  | "btc"
  | "cad"
  | "cny"
  | "eth"
  | "eur"
  | "gbp"
  | "jpy"
  | "php"
  | "rub"
  | "thb"
  | "usd";

export type CurrencyOrDenominationType =
  | BitcoinDenominationTypes
  | SupportedCurrencyTypes;

export interface SupportedCurrency {
  code: SupportedCurrencyTypes;
  fullName: string;
}
