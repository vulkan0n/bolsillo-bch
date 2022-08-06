import React, { useState } from "react";
import {
  webViewRender,
  emit,
  useNativeMessage,
} from "react-native-react-bridge/lib/web";

const Root = () => {
  const [data, setData] = useState("");
  // useNativeMessage hook receives message from React Native
  useNativeMessage((message) => {
    console.log("got back message: ", { message });
    if (message.type === "success") {
      setData(message.data);
    }
  });

  return (
    <div>
      <h1>Test</h1>
      <h2>{data}</h2>
      <button
        title="Clickable button"
        onClick={async () => {
          const wallet = await TestNetWallet.newRandom();
          const mnemonic = wallet?.mnemonic;
          console.log({ wallet, mnemonic });
          console.log("clicked!! sent from webview");
          // emit sends message to React Native
          //   type: event name
          //   data: some data which will be serialized by JSON.stringify
          emit({ type: "createdWallet", data: { mnemonic } });
        }}
      />
    </div>
  );
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Root />);
