import { CoinType } from "..";

export interface TransactionPadState {
  view: "" | "NumPad" | "Send" | "Confirm";
  sendInputView: "Text" | "Scan";
  padBalance: string;
  sendToAddress: string;
  isSendingCoins: boolean;
  spentUTXOs: CoinType[];
  error: string;
}
