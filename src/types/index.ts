import { ExchangeRatesState } from "@redux/reducers/exchangeRatesReducer";
import { SettingsState } from "@redux/reducers/settingsReducer";
import { TransactionPadState } from "@redux/reducers/transactionPadReducer";
import { WalletManagerState } from "@redux/reducers/walletManagerReducer";
import { LocalState } from "@redux/reducers/localReducer";

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
  tx_hash: string;
  height?: number;
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
