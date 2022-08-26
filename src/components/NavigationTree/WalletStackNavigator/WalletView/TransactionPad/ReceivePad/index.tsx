import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import Button from "@atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "@design/typography";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@design/colours";
import { iconImport } from "@design/icons";
import {
  selectActiveWallet,
  selectActiveWalletIsZeroBalance,
} from "@redux/selectors";

const ReceivePad = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));

  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const isZeroBalance = useSelector((state: ReduxState) =>
    selectActiveWalletIsZeroBalance(state)
  );

  const onPressClipboard = async () => {
    await Clipboard.setStringAsync(wallet?.cashaddr);
    Toast.show({
      type: "customSuccess",
      props: {
        title: "Copied to clipboard",
        text: wallet?.cashaddr,
      },
    });
  };

  const onPressShare = () => {
    Toast.show({
      type: "customError",
      props: {
        title: "TODO",
        text: "Implement share feature",
      },
    });
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "",
      })
    );
  };

  const ShareButton = (
    <Button onPress={onPressShare} size={"small"}>
      Share
    </Button>
  );

  const logo = require("../../../../../../assets/images/bch.png");

  return (
    <View style={styles.inputBackground as any}>
      <Pressable onPress={onPressClipboard} style={styles.receivePad as any}>
        <View style={styles.qrBorder}>
          <QRCode
            size={225}
            value={`${wallet?.cashaddr}`}
            color={COLOURS.black}
            logo={logo}
            logoSize={60}
          />
        </View>
        <Text selectable style={TYPOGRAPHY.p as any}>
          {wallet?.cashaddr}
        </Text>
        <FontAwesomeIcon
          icon={iconImport("faPaste")}
          size={30}
          color={COLOURS.black}
        />
      </Pressable>
      {!isZeroBalance && (
        <View style={styles.buttonContainer as any}>
          {/* {isRightHandedMode && ShareButton} */}
          <Button
            icon={"faChevronLeft"}
            variant="secondary"
            onPress={onPressBack}
            size={"small"}
          >
            Back
          </Button>
          {/* {!isRightHandedMode && ShareButton} */}
        </View>
      )}
    </View>
  );
};

export default ReceivePad;
