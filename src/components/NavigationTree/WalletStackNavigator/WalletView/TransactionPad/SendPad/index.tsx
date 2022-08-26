import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import Button from "@atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadView } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import ScanEntry from "./ScanEntry";
import ImageEntry from "./ImageEntry";
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

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  };

  const AddressEntry = () => {
    switch (sendToAddressEntry) {
      case "Text":
        return <TextEntry />;
      case "Scan":
        return <ScanEntry />;
      case "Image":
        return <ImageEntry />;
      default:
        return <ScanEntry />;
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
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          size="small"
        >
          Back
        </Button>
      </View>
    </View>
  );
};

export default SendPad;
