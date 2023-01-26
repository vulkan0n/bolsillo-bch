// Compensate for lagging Expo support for React 18 createRoot syntax
// Combined with need to run on web
// https://github.com/expo/expo/issues/18485#issuecomment-1221353737
import { AppRegistry } from "react-native";
import { IS_WEB } from "@selene-wallet/app/src/utils/isWeb";

import App from "./App";
import { createRoot } from "react-dom/client";

AppRegistry.registerComponent("main", () => App);
if (IS_WEB) {
  const rootTag = createRoot(
    document.getElementById("root") ?? document.getElementById("main")
  );
  rootTag.render(<App />);
}
