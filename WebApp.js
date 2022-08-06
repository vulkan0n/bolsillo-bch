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
    if (message.type === "success") {
      setData(message.data);
    }
  });
  return (
    <div>
      <div>{data}</div>
      <button
        onClick={() => {
          // emit sends message to React Native
          //   type: event name
          //   data: some data which will be serialized by JSON.stringify
          emit({ type: "hello", data: 123 });
        }}
      />
    </div>
  );
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Root />);
