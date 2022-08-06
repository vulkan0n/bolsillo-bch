import React from "react";
import {
  webViewRender,
  emit,
  useNativeMessage,
} from "react-native-react-bridge/lib/web";
import {
  BRIDGE_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
} from "./src/utils/bridgeMessages";

const Bridge = () => {
  // useNativeMessage hook receives message from React Native
  useNativeMessage(async (message) => {
    console.log("Bridge received: ", message);

    switch (message.type) {
      case BRIDGE_MESSAGE_TYPES.CREATE_WALLET:
        const wallet = await TestNetWallet.newRandom();
        emit({
          type: RESPONSE_MESSAGE_TYPES.CREATE_WALLET_RESPONSE,
          data: { wallet },
        });
        break;
      default:
        console.log("NOTE: Message type not recognised!!");
        break;
      // code block
    }
  });

  return <div style={{ height: 0 }}></div>;
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Bridge />);
