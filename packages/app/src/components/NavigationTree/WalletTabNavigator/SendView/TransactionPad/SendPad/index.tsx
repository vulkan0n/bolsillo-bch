import React from "react";
import { View } from "react-native";
import styles from "./styles";
import { useSelector } from "react-redux";
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
