import React, { useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import TextInput from "@selene-wallet/app/src/components/atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import { updateTransactionPadSendToAddress } from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { formatStringToCashAddress } from "@selene-wallet/app/src/utils/formatting";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import COLOURS from "@selene-wallet/common/design/colours";
import { selectPrimaryCurrencyOrDenomination } from "@selene-wallet/app/src/redux/selectors";
import { processRequestString } from "../utils";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

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

  const onChangeTextInput = (value: string) => {
    dispatch(
      updateTransactionPadSendToAddress({
        sendToAddress: value,
      })
    );
  };

  return (
    <View style={styles.entryColumn as any}>
      <Text style={TYPOGRAPHY.p}>Type or paste bitcoincash: address</Text>
      <TextInput
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
