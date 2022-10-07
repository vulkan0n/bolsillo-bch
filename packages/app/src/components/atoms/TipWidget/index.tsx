import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import emit from "@selene-wallet/app/src/utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import {
  updateTransactionPadIsSendingCoins,
  updateTransactionPadBalance,
} from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { selectActiveWalletBalance } from "@selene-wallet/app/src/redux/selectors";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import { navigate } from "@selene-wallet/app/src/components/NavigationTree/rootNavigation";
import { BITCOIN_DENOMINATIONS } from "@selene-wallet/common/dist/utils/consts";
import { convertBalanceToDisplay } from "@selene-wallet/app/src/utils/formatting";

interface Props {
  donationBchAddress: string;
  isWhiteText?: boolean;
}

function TipWidget({ donationBchAddress, isWhiteText = false }: Props) {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const dispatch = useDispatch();
  const { isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { availableRawSats } = useSelector((state: ReduxState) =>
    selectActiveWalletBalance(state)
  );
  const tipAmountInIntSats = 100000;
  const displayTipAmount = convertBalanceToDisplay(
    `${tipAmountInIntSats}`,
    BITCOIN_DENOMINATIONS.satoshis,
    "usd"
  );

  const onPressTipBch = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: donationBchAddress,
        satsToSend: tipAmountInIntSats,
        isTestNet,
      },
    });

    dispatch(
      updateTransactionPadIsSendingCoins({
        isSendingCoins: true,
      })
    );
  };

  const onPressCustomAmount = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );

    navigate("CustomTipModal", {
      donationBchAddress,
    });
  };

  if (!donationBchAddress) {
    return null;
  }

  return (
    <View style={styles.container as any}>
      <View style={styles.wrapper as any}>
        <Button
          onPress={onPressTipBch}
          variant="primary"
          isLoading={isSendingCoins}
          isDisabled={tipAmountInIntSats > parseInt(availableRawSats)}
        >
          Tip {displayTipAmount}
        </Button>
        <Pressable onPress={onPressCustomAmount}>
          <Text
            style={
              (isWhiteText
                ? TYPOGRAPHY.pWhiteUnderlined
                : TYPOGRAPHY.pUnderlined) as any
            }
          >
            Custom amount
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default TipWidget;
