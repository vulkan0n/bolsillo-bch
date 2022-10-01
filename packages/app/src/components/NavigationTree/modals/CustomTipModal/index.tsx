import React from "react";
import { View } from "react-native";
import Button from "@selene/app/src/components/atoms/Button";
import styles from "./styles";
import { MotiView } from "moti";
import { useDispatch, useSelector } from "react-redux";
import NumPad from "@selene/app/src/components/atoms/NumPad";
import LiveBalance from "@selene/app/src/components/atoms/LiveBalance";
import AvailableBalance from "../../WalletTabNavigator/SendView/AvailableBalance";
import {
  selectPadBalanceInRawSats,
  selectPadPrimaryBalance,
  selectActiveWallet,
} from "@selene/app/src/redux/selectors";
import { ReduxState } from "@selene/app/src/types";
import emit from "@selene/app/src/utils/emit";
import {
  updateTransactionPadIsSendingCoins,
  updateTransactionPadBalance,
} from "@selene/app/src/redux/reducers/transactionPadReducer";
import { BRIDGE_MESSAGE_TYPES } from "@selene/app/src/utils/bridgeMessages";

function CustomTipModal({ navigation, route }) {
  const { donationBchAddress } = route?.params;
  const dispatch = useDispatch();
  const primaryBalance = useSelector((state: ReduxState) =>
    selectPadPrimaryBalance(state)
  );
  const padBalanceInRawSats = useSelector((state: ReduxState) =>
    selectPadBalanceInRawSats(state)
  );

  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const tipAmountInIntSats = parseInt(padBalanceInRawSats);

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

  const onPressCancel = () => {
    dispatch(
      updateTransactionPadBalance({
        padBalance: "0",
      })
    );

    navigation.navigate("Tab Navigator");
  };

  return (
    <View style={styles.container as any}>
      <MotiView
        from={{ opacity: 0, translateY: 35 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1200 }}
        style={styles.motiView as any}
      >
        <AvailableBalance />
        <View style={styles.whiteWrapper}>
          <LiveBalance />
        </View>
        <NumPad isCheckInsufficientBalance />
        <Button
          isDisabled={tipAmountInIntSats === 0}
          isLoading={isSendingCoins}
          onPress={onPressTipBch}
          variant={"primary"}
        >
          Tip {primaryBalance}
        </Button>
        <Button icon={"faXmark"} onPress={onPressCancel} variant={"secondary"}>
          Cancel
        </Button>
      </MotiView>
    </View>
  );
}

export default CustomTipModal;
