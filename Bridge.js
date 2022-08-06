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
// import { connect } from "react-redux";

const Bridge = () => {
  console.log("bridge loaded");
  // useNativeMessage hook receives message from React Native
  useNativeMessage(async (message) => {
    console.log("Bridge received: ", message);

    switch (message.type) {
      case BRIDGE_MESSAGE_TYPES.CREATE_WALLET:
        const wallet = await TestNetWallet.named("Default");
        emit({
          type: RESPONSE_MESSAGE_TYPES.CREATE_WALLET_RESPONSE,
          data: { wallet },
        });
        break;
      case BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE:
        console.log("received request message");
        const walletRequestBalance = await TestNetWallet.namedExists("Default");
        const balance = await wallet.getBalance();
        console.log("retrieved balance");
        console.log({ balance });
        emit({
          type: RESPONSE_MESSAGE_TYPES.REQUEST_BALANCE_RESPONSE,
          data: { balance },
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
