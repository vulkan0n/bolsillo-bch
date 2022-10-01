import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import COLOURS from "@selene/common/design/colours";
import Button from "@selene/app/src/components/atoms/Button";
import emit from "@selene/app/src/utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@selene/app/src/utils/bridgeMessages";
import { ReduxState } from "@selene/app/src/types";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@selene/app/src/redux/selectors";
import {
  updateTransactionPadIsSendingCoins,
  updateTransactionPadBalance,
} from "@selene/app/src/redux/reducers/transactionPadReducer";
import { selectActiveWalletBalance } from "@selene/app/src/redux/selectors";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "./styles";
import { navigate } from "@selene/app/src/components/NavigationTree/rootNavigation";
import { BITCOIN_DENOMINATIONS } from "@selene/app/src/utils/consts";
import { convertBalanceToDisplay } from "@selene/app/src/utils/formatting";

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
              isWhiteText ? TYPOGRAPHY.pWhiteUnderlined : TYPOGRAPHY.pUnderlined
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
