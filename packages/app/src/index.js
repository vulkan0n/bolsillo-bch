// Compensate for lagging Expo support for React 18 createRoot syntax
// Combined with need to run on web
// https://github.com/expo/expo/issues/18485#issuecomment-1221353737
import "expo/build/Expo.fx";
import { AppRegistry } from "react-native";
import withExpoRoot from "expo/build/launch/withExpoRoot";
import { IS_WEB } from "@selene/app/src/utils/isWeb";

import App from "./App";
import { createRoot } from "react-dom/client";

AppRegistry.registerComponent("main", () => withExpoRoot(App));
if (IS_WEB) {
  const rootTag = createRoot(
    document.getElementById("root") ?? document.getElementById("main")
  );
  const RootComponent = withExpoRoot(App);
  rootTag.render(<RootComponent />);
}
