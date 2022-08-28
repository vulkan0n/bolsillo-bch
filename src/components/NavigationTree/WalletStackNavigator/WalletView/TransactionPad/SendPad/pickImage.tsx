import React from "react";
import { Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "./ImageEntry/styles";
import TYPOGRAPHY from "@design/typography";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from "react-native-toast-message";
import { formatStringToCashAddress } from "@utils/formatting";
import { isValidCashAddress } from "@utils/validation";
import { useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
} from "@redux/reducers/transactionPadReducer";

const pickImage = async (dispatch) => {
  // No permissions request is necessary for launching the image library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: false,
    allowsMultipleSelection: false,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  });

  if (result && result.uri) {
    const results = await BarCodeScanner.scanFromURLAsync(result.uri);
    if (results.length === 0) {
      Toast.show({
        type: "customError",
        props: {
          title: "No QR code detected!",
          text: "Pick another image.",
        },
      });
    } else if (results.length === 1) {
      const potentialAddress = results?.[0]?.data;
      const formattedAddress = formatStringToCashAddress(potentialAddress);
      const isValidAddress = isValidCashAddress(formattedAddress);

      if (isValidAddress) {
        dispatch(
          updateTransactionPadSendToAddress({
            sendToAddress: formattedAddress,
          })
        );
        dispatch(
          updateTransactionPadView({
            view: "Confirm",
          })
        );
      } else {
        Toast.show({
          type: "customError",
          props: {
            title: "Incompatible QR code!",
            text: "QR code not a BCH address.",
          },
        });
      }
    } else {
      Toast.show({
        type: "customError",
        props: {
          title: "Too many QR codes!",
          text: "Image must contain exactly 1 QR code.",
        },
      });
    }
  }
};

export default pickImage;
