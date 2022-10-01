import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import Button from "@selene/app/src/components/atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadView } from "@selene/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene/common/dist/types";
import ScanEntry from "./ScanEntry";
import ButtonRow from "./ButtonRow";
import TextEntry from "./TextEntry";
import AvailableBalance from "../../AvailableBalance";

const SendPad = () => {
  const dispatch = useDispatch();

  const { sendInputView } = useSelector(
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
    switch (sendInputView) {
      case "Text":
        return <TextEntry />;
      case "Scan":
        return <ScanEntry />;
      default:
        return <ScanEntry />;
    }
  };

  return (
    <View style={styles.inputBackground as any}>
      {AddressEntry()}
      <ButtonRow />
    </View>
  );
};

export default SendPad;
