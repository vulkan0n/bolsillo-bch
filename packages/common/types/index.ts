import { ExchangeRatesState } from "./reducers/exchangeRatesReducer";
import { SettingsState } from "./reducers/settingsReducer";
import { TransactionPadState } from "./reducers/transactionPadReducer";
import { WalletManagerState } from "./reducers/walletManagerReducer";
import { LocalState } from "./reducers/localReducer";

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
  maxAddressIndex: number;
}

export interface TransactionType {
  txn: string;
  blockheight?: number;
  note?: string;
}

export interface TransactionHistoryTxType {
  blockheight: number;
  txn: string;
  transactionId: string;
  balance: number;
  fee: number;
  from: string;
  to: string;
  index: number;
  unit: string;
  value: number;
}

export interface CoinType {
  height: number;
  transactionId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
  addressIndex: string;
}

export interface SeleneAddressType {
  hdWalletIndex: number;
  coins: CoinType[];
  cashaddr: string;
  transactions: TransactionHistoryTxType[];
}

export interface SeleneWalletType {
  name: string;
  description: string;
  mnemonic: string;
  derivationPath: string;
  transactions: TransactionType[];
  maxAddressIndex: number;
  addresses: SeleneAddressType[];
}

// A bundle that makes CashAddresses easier to find
export interface TaggedCashAddressType {
  cashaddr: string;
  name: string; // Name of the wallet that this cashAddress can be found in
  hdWalletIndex: number; // hdWalletIndex of the cashAddress within its wallet
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

export type CheckInPeriodTypes = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
