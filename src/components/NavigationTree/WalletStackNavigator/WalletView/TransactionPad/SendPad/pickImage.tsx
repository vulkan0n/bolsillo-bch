import * as ImagePicker from "expo-image-picker";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from "react-native-toast-message";
import { processRequestString } from "./utils";

const pickImage = async ({ dispatch, primaryCurrency, isTestNet }) => {
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
      const { isValid } = processRequestString({
        dispatch,
        primaryCurrency,
        requestString: results?.[0]?.data,
        isTestNet,
      });

      if (!isValid) {
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
