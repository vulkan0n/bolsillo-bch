import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import Slider from "react-native-slide-to-unlock";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadView,
  updateTransactionPadIsSendingCoins,
} from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene-wallet/common/dist/types";
import emit from "@selene-wallet/app/src/utils/emit";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  selectActiveWallet,
  selectPadBalanceInRawSats,
} from "@selene-wallet/app/src/redux/selectors";
import LiveBalance from "@selene-wallet/app/src/components/atoms/LiveBalance";
import { TEN_SECONDS } from "@selene-wallet/common/dist/utils/consts";
import { selectIsPadZeroBalance } from "@selene-wallet/app/src/redux/selectors";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";
import COLOURS from "@selene-wallet/common/design/colours";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene-wallet/app/src/design/icons";

const Confirm = () => {
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

  const onSwipeSend = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: sendToAddress,
        satsToSend: rawSatsToSend,
        coins: wallet?.coins,
        changeAddress: wallet?.cashaddr,
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
          <Loading style={styles.activityIndicator} />
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
        <View style={{ width: "100%" }}>
          <Slider
            childrenContainer={styles.sliderChildren as any}
            onEndReached={onSwipeSend}
            containerStyle={styles.sliderContainer as any}
            sliderElement={
              <View style={styles.sliderHandle as any}>
                <FontAwesomeIcon
                  icon={iconImport("faPaperPlane")}
                  size={35}
                  color={COLOURS.white}
                />
              </View>
            }
          >
            <View style={styles.sliderChildrenWrapper as any}>
              <Text style={styles.sliderText as any}>{"Slide to send"}</Text>
              <View style={styles.sliderIconContainer}>
                <FontAwesomeIcon
                  icon={iconImport("faChevronRight")}
                  size={20}
                  color={COLOURS.black}
                />
              </View>
              <View style={styles.sliderIconContainer}>
                <FontAwesomeIcon
                  icon={iconImport("faChevronRight")}
                  size={20}
                  color={COLOURS.black}
                />
              </View>
              <View style={styles.sliderIconContainer}>
                <FontAwesomeIcon
                  icon={iconImport("faChevronRight")}
                  size={20}
                  color={COLOURS.black}
                />
              </View>
            </View>
          </Slider>
        </View>
      )}

      {isPadZeroBalance && (
        <Button
          icon={"faBitcoinSign"}
          onPress={onPressEnterAmount}
          size="small"
        >
          Enter amount
        </Button>
      )}
      <Button
        icon={"faArrowLeft"}
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
