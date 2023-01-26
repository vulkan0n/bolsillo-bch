import { AppRegistry } from "react-native";
import { IS_WEB } from "@selene-wallet/app/src/utils/isWeb";

import App from "./App";
import { createRoot } from "react-dom/client";

console.log("loaded 2");

AppRegistry.registerComponent("main", () => App);
if (IS_WEB) {
  const rootTag = createRoot(
    document.getElementById("root") ?? document.getElementById("main")
  );
  rootTag.render(<App />);
}
