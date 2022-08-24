import React from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import Button from "../../../../../../atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddressEntry } from "../../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../../types";

const ButtonColumn = () => {
  const dispatch = useDispatch();
  const { sendToAddressEntry } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const onPressText = () => {
    dispatch(
      updateTransactionPadSendToAddressEntry({
        sendToAddressEntry: "Text",
      })
    );
  };

  const onPressScan = () => {
    dispatch(
      updateTransactionPadSendToAddressEntry({
        sendToAddressEntry: "Scan",
      })
    );
  };

  const onPressImage = () => {
    dispatch(
      updateTransactionPadSendToAddressEntry({
        sendToAddressEntry: "Image",
      })
    );
  };

  return (
    <View style={styles.buttonContainerColumn as any}>
      <Button
        icon="faKeyboard"
        variant={sendToAddressEntry === "Text" ? "primary" : "secondary"}
        onPress={onPressText}
      >
        Text
      </Button>
      <Button
        icon="faQrcode"
        variant={sendToAddressEntry === "Scan" ? "primary" : "secondary"}
        onPress={onPressScan}
      >
        Scan
      </Button>
      <Button
        icon="faImage"
        variant={sendToAddressEntry === "Image" ? "primary" : "secondary"}
        onPress={onPressImage}
      >
        Img
      </Button>
    </View>
  );
};

export default ButtonColumn;
