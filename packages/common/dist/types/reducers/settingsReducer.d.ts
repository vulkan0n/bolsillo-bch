import { SupportedCurrencyTypes, BitcoinDenominationTypes } from "..";
export interface SettingsState {
    isBchDenominated: boolean;
    contrastCurrency: SupportedCurrencyTypes;
    bitcoinDenomination: BitcoinDenominationTypes;
    isRightHandedMode: boolean;
    isShowAvailableBalance: boolean;
    isShowCommunityTab: boolean;
    isTestNet: boolean;
}
