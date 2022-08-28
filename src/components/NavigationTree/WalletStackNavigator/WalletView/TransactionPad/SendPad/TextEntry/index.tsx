import React, { useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TextInput from "@atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddress } from "@redux/reducers/transactionPadReducer";
import { ReduxState } from "@types";
import { formatStringToCashAddress } from "@utils/formatting";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@design/icons";
import COLOURS from "@design/colours";
import Toast from "react-native-toast-message";
import SPACING from "@design/spacing";
import { isValidCashAddress } from "../../../../../../../utils/validation";
import { updateTransactionPadView } from "../../../../../../../redux/reducers/transactionPadReducer";

const TextEntry = () => {
  const dispatch = useDispatch();

  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  useEffect(() => {
    if (isValidCashAddress(sendToAddress, isTestNet)) {
      dispatch(
        updateTransactionPadView({
          view: "Confirm",
        })
      );
    }
  }, [sendToAddress]);

  const onPressPaste = async () => {
    const clipboardString = await Clipboard.getStringAsync();
    const text = formatStringToCashAddress(clipboardString);

    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: text,
      })
    );
  };

  const onChangeTextInput = (value) => {
    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: formatStringToCashAddress(value, isTestNet),
      })
    );
  };

  return (
    <View style={styles.entryColumn as any}>
      <TextInput
        placeholder={"bitcoincash:"}
        text={sendToAddress}
        onChange={onChangeTextInput}
        isSmallText
        isMultiline
        numberOfLines={3}
      />
      <Pressable onPress={onPressPaste}>
        <FontAwesomeIcon
          icon={iconImport("faPaste")}
          size={30}
          color={COLOURS.black}
        />
      </Pressable>
    </View>
  );
};

export default TextEntry;
