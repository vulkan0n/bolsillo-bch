import { Audio } from "expo-av";
import Toast from "react-native-toast-message";
import { ONE_SECOND } from "@selene-wallet/common/dist/utils/consts";

export const receiveCoinsEvent = async () => {
  const { sound } = await Audio.Sound.createAsync(require("./receive.mp3"));

  Toast.show({
    type: "customSuccess",
    props: {
      title: "Received Bitcoin Cash",
      text: "Peer-to-peer electronic cash!",
    },
  });

  // Sound duration: 1 second
  await sound.playAsync();
  setTimeout(() => {
    // Unload sound to prevent memory leak
    sound.unloadAsync();
  }, ONE_SECOND * 3);
};
