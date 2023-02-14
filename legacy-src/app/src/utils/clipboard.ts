import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

export const copyAddressToClipboard = async (address: string) => {
  await Clipboard.setStringAsync(address);

  Toast.show({
    type: "customSuccess",
    props: {
      title: `Copied payment address.`,
      text: address ?? "",
    },
  });
};
