import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import Button from "../../../../../atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadView } from "../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../types";
import QrScanner from "../QrScanner";
import ButtonColumn from "./ButtonColumn";
import TextEntry from "./TextEntry";

const SendPad = () => {
  const dispatch = useDispatch();

  const { sendToAddressEntry } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Confirm",
      })
    );
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  };

  const SendButton = (
    <Button icon={"faPaperPlane"} onPress={onPressSend} size="small">
      Send
    </Button>
  );

  const ScanEntry = (
    <View style={styles.entryRow as any}>
      <QrScanner />
    </View>
  );

  const ImageEntry = (
    <View style={styles.entryRow as any}>
      <Text>Image entry</Text>
    </View>
  );

  const AddressEntry = () => {
    switch (sendToAddressEntry) {
      case "Text":
        return <TextEntry />;
      case "Scan":
        return ScanEntry;
      case "Image":
        return ImageEntry;
      default:
        return ScanEntry;
        break;
    }
  };

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.numPad as any}>
        {!isRightHandedMode && <ButtonColumn />}
        {AddressEntry()}
        {isRightHandedMode && <ButtonColumn />}
      </View>
      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && SendButton}
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          size="small"
        >
          Back
        </Button>
        {!isRightHandedMode && SendButton}
      </View>
    </View>
  );
};

export default SendPad;
