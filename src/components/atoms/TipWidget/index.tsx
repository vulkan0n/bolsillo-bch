import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import COLOURS from "@design/colours";
import Button from "@atoms/Button";
import emit from "@utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ReduxState } from "@types";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@redux/reducers/transactionPadReducer";
import { selectActiveWalletBalance } from "@redux/selectors";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";

interface Props {
  donationBchAddress: string;
  isWhiteText: boolean;
}

function TipWidget({ donationBchAddress, isWhiteText = false }: Props) {
  const [tipAmountInIntSats, setTipAmountInIntSats] = useState(100000);
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const dispatch = useDispatch();
  const { isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { availableRawSats } = useSelector((state: ReduxState) =>
    selectActiveWalletBalance(state)
  );

  const onPressTipBch = () => {
    if (!donationBchAddress) {
      return;
    }

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
    console.log("custom amount");
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Button
          onPress={onPressTipBch}
          variant="primary"
          icon={"faBitcoinSign"}
          isLoading={isSendingCoins}
          isDisabled={tipAmountInIntSats > parseInt(availableRawSats)}
        >
          Tip {`${tipAmountInIntSats}`} sats
        </Button>
        <Pressable onPress={onPressCustomAmount}>
          <Text
            style={isWhiteText ? TYPOGRAPHY.pWhiteUnderlined : TYPOGRAPHY.p}
          >
            Custom amount
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default TipWidget;
