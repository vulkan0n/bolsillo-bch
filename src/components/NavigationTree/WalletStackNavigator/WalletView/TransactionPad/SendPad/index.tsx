import React from "react";
import { View, Pressable, Text } from "react-native";
import styles from "./styles";
import Button from "../../../../../atoms/Button";
import TextInput from "../../../../../atoms/TextInput";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadSendToAddressEntry,
  updateTransactionPadView,
} from "../../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../../types";
import { formatStringToCashAddress } from "../../../../../../utils/formatting";
import QrScanner from "../QrScanner";
import * as Clipboard from "expo-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../../../../design/icons";
import COLOURS from "../../../../../../design/colours";
import Toast from "react-native-toast-message";

const SendPad = () => {
  const dispatch = useDispatch();

  const { sendToAddress, sendToAddressEntry } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
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

  const onPressSend = () => {
    dispatch(
      updateTransactionPadView({
        view: "Confirm",
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

  const TextEntry = (
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
        return TextEntry;
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
        {AddressEntry()}
        <View style={styles.buttonContainer as any}>
          <Button
            icon="faKeyboard"
            variant={sendToAddressEntry === "Text" ? "primary" : "secondary"}
            size={"small"}
            onPress={onPressText}
          >
            Text
          </Button>
          <Button
            icon="faQrcode"
            variant={sendToAddressEntry === "Scan" ? "primary" : "secondary"}
            size={"small"}
            onPress={onPressScan}
          >
            Scan
          </Button>
          <Button
            icon="faImage"
            variant={sendToAddressEntry === "Image" ? "primary" : "secondary"}
            size={"small"}
            onPress={onPressImage}
          >
            Image
          </Button>
        </View>
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
