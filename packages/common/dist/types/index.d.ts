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
export declare type BitcoinDenominationTypes = "bitcoins" | "millibits" | "bits" | "satoshis";
export declare type SupportedCurrencyTypes = "aud" | "btc" | "cad" | "cny" | "eth" | "eur" | "gbp" | "jpy" | "php" | "rub" | "thb" | "usd";
export declare type CurrencyOrDenominationType = BitcoinDenominationTypes | SupportedCurrencyTypes;
export interface SupportedCurrency {
    code: SupportedCurrencyTypes;
    fullName: string;
}
