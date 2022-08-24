import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import Button from "../../../../../atoms/Button";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../../utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadIsSendingCoins,
} from "../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../types";
import { convertRawCurrencyToRawSats } from "../../../../../../utils/formatting";
import emit from "../../../../../../utils/emit";
import TYPOGRAPHY from "../../../../../../design/typography";
import { selectActiveWallet } from "../../../../../../redux/selectors";

const Confirm = ({ navigation }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { padBalance } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    useSelector((state: ReduxState) => state.settings);

  const { sendToAddress, isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const inputCurrency = isBchDenominated
    ? bitcoinDenomination
    : contrastCurrency;
  const rawSatsToSend = convertRawCurrencyToRawSats(padBalance, inputCurrency);

  const onPressSend = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: sendToAddress,
        satsToSend: rawSatsToSend,
        isTestNet,
      },
    });

    dispatch(
      updateTransactionPadIsSendingCoins({
        isSendingCoins: true,
      })
    );
  };

  const onPressCancelLoading = () => {
    dispatch(
      updateTransactionPadIsSendingCoins({
        isSendingCoins: false,
      })
    );
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "Send",
      })
    );
  };

  const SendButton = (
    <Button icon={"faPaperPlane"} onPress={onPressSend} isSmall>
      Send
    </Button>
  );

  if (isSendingCoins) {
    return (
      <Pressable
        onPress={onPressCancelLoading}
        style={styles.inputBackground as any}
      >
        <Text>Sending...</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.inputBackground as any}>
      <Text style={TYPOGRAPHY.h2black as any}>to</Text>
      <Text style={TYPOGRAPHY.p as any}>{sendToAddress}</Text>

      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && SendButton}
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          isSmall
        >
          Back
        </Button>
        {!isRightHandedMode && SendButton}
      </View>
    </View>
  );
};

export default Confirm;
