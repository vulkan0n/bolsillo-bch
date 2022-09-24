import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadView,
  updateTransactionPadIsSendingCoins,
} from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import emit from "@utils/emit";
import TYPOGRAPHY from "@design/typography";
import {
  selectActiveWallet,
  selectPadBalanceInRawSats,
} from "@redux/selectors";
import LiveBalance from "@atoms/LiveBalance";
import COLOURS from "@design/colours";
import { TEN_SECONDS } from "@utils/consts";
import { selectIsPadZeroBalance } from "@redux/selectors";

const Confirm = ({ navigation }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const rawSatsToSend = useSelector((state: ReduxState) =>
    selectPadBalanceInRawSats(state)
  );
  const isPadZeroBalance = useSelector((state: ReduxState) =>
    selectIsPadZeroBalance(state)
  );

  const { sendToAddress, isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!isSendingCoins) {
      return;
    }

    setTimeout(() => {
      setIsStuck(true);
    }, TEN_SECONDS);
  }, [isSendingCoins]);

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

  const onPressEnterAmount = () => {
    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  };

  const onPressCancelLoading = () => {
    if (isStuck) {
      dispatch(
        updateTransactionPadIsSendingCoins({
          isSendingCoins: false,
        })
      );
      dispatch(
        updateTransactionPadView({
          view: "Send",
        })
      );
    }
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  };

  if (isSendingCoins) {
    return (
      <Pressable
        onPress={onPressCancelLoading}
        style={styles.inputBackground as any}
      >
        <View style={styles.inputBackground as any}>
          <Text style={TYPOGRAPHY.h1black as any}>Sending...</Text>
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={COLOURS.black}
          />
          {isStuck && <Text style={TYPOGRAPHY.p as any}>(Tap if stuck)</Text>}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.inputBackground as any}>
      <Text style={TYPOGRAPHY.h2black as any}>Sending</Text>
      <LiveBalance isHideZeroButton isHideMaxButton />
      <Text style={TYPOGRAPHY.h2black as any}>to</Text>
      <Text style={TYPOGRAPHY.p as any}>{sendToAddress}</Text>

      {!isPadZeroBalance && (
        <Button icon={"faPaperPlane"} onPress={onPressSend} isSmall>
          Send
        </Button>
      )}
      {isPadZeroBalance && (
        <Button icon={"faBitcoinSign"} onPress={onPressEnterAmount} isSmall>
          Enter amount
        </Button>
      )}
      <Button
        icon={"faChevronLeft"}
        variant="secondary"
        onPress={onPressBack}
        size={"small"}
      >
        Back
      </Button>
    </View>
  );
};

export default Confirm;
