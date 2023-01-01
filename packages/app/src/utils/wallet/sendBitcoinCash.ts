import emit from "@selene-wallet/app/src/utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { SeleneWalletType } from "@selene-wallet/common/dist/types";
import {
  getWalletDepositAddress,
  getWalletUTXOsToSendAmount,
} from "@selene-wallet/app/src/utils/wallet";
import { updateTransactionPadIsSendingCoins } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import store from "@selene-wallet/app/src/redux/store";

interface Props {
  wallet: SeleneWalletType;
  recipientCashAddr: string;
  satsToSend: number;
}

export const sendBitcoinCash = async ({
  wallet,
  recipientCashAddr,
  satsToSend,
}: Props) => {
  const isTestNet = store.getState().settings.isTestNet || false;

  emit({
    type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
    data: {
      name: wallet?.name,
      mnemonic: wallet?.mnemonic,
      derivationPath: wallet?.derivationPath,
      recipientCashAddr,
      satsToSend,
      coins: getWalletUTXOsToSendAmount(wallet, satsToSend),
      changeAddress: getWalletDepositAddress(wallet),
      isTestNet,
    },
  });

  store.dispatch(
    updateTransactionPadIsSendingCoins({
      isSendingCoins: true,
    })
  );
};
