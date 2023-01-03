import emit from "@selene-wallet/app/src/utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { CoinType, SeleneWalletType } from "@selene-wallet/common/dist/types";
import {
  getWalletDepositAddress,
  getWalletUTXOsToSendAmount,
  getWalletAddressHdIndex,
} from "@selene-wallet/app/src/utils/wallet";
import {
  updateTransactionPadIsSendingCoins,
  stashSpentUTXOs,
} from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import store from "@selene-wallet/app/src/redux/store";

interface StashProps {
  wallet: SeleneWalletType;
  utxos: CoinType[];
}

const temporarilyStashSpentUTXOs = async ({ wallet, utxos }: StashProps) => {
  store.dispatch(
    stashSpentUTXOs({
      wallet,
      utxos,
    })
  );
};

interface SendProps {
  wallet: SeleneWalletType;
  recipientCashAddr: string;
  satsToSend: number;
}

export const sendBitcoinCash = async ({
  wallet,
  recipientCashAddr,
  satsToSend,
}: SendProps) => {
  const isTestNet = store.getState().settings.isTestNet || false;
  const utxos = getWalletUTXOsToSendAmount(wallet, satsToSend);

  // Stash these UTXOs as sent
  // If the transaction fails, these UTXOs will be restored
  temporarilyStashSpentUTXOs({ wallet, utxos });
  const changeAddress = getWalletDepositAddress(wallet);
  const changeAddressHdIndex = getWalletAddressHdIndex(wallet, changeAddress);

  emit({
    type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
    data: {
      wallet,
      recipientCashAddr,
      satsToSend,
      coins: utxos,
      changeAddress,
      changeAddressHdIndex,
      isTestNet,
    },
  });

  store.dispatch(
    updateTransactionPadIsSendingCoins({
      isSendingCoins: true,
    })
  );
};
