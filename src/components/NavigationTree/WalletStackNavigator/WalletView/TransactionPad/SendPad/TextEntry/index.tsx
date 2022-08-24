import React from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TextInput from "../../../../../../atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddress } from "../../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../../types";
import { formatStringToCashAddress } from "../../../../../../../utils/formatting";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../../../../../design/icons";
import COLOURS from "../../../../../../../design/colours";
import Toast from "react-native-toast-message";
import SPACING from "../../../../../../../design/spacing";

const TextEntry = () => {
  const dispatch = useDispatch();

  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );

  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const onPressPaste = async () => {
    const clipboardString = await Clipboard.getStringAsync();
    const text = formatStringToCashAddress(clipboardString);

    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: text,
      })
    );

    Toast.show({
      type: "customSuccess",
      props: {
        title: "Pasted from clipboard",
        text,
      },
    });
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
