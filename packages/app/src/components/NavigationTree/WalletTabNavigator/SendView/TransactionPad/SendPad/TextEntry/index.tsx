import React, { useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TextInput from "@selene/app/src/components/atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddress } from "@selene/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene/app/src/types";
import { formatStringToCashAddress } from "@selene/app/src/utils/formatting";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene/app/src/design/icons";
import COLOURS from "@selene/common/design/colours";
import { selectPrimaryCurrencyOrDenomination } from "@selene/app/src/redux/selectors";
import { processRequestString } from "../utils";

const TextEntry = () => {
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const { sendToAddress } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  useEffect(() => {
    processRequestString({
      dispatch,
      primaryCurrency,
      requestString: sendToAddress,
      isTestNet,
    });
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
