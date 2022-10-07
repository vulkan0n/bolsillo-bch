import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadView } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene-wallet/common/dist/types";
import ScanEntry from "./ScanEntry";
import ButtonRow from "./ButtonRow";
import TextEntry from "./TextEntry";

const SendPad = () => {
  const { sendInputView } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  return (
    <View style={styles.inputBackground as any}>
      {sendInputView === "Text" ? <TextEntry /> : <ScanEntry />}
      <ButtonRow />
    </View>
  );
};

export default SendPad;
