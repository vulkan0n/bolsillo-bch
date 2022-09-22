// Compensate for lagging Expo support for React 18 createRoot syntax
// Combined with need to run on web
// https://github.com/expo/expo/issues/18485#issuecomment-1221353737
import "expo/build/Expo.fx";
import { AppRegistry, Platform } from "react-native";
import withExpoRoot from "expo/build/launch/withExpoRoot";

import App from "./App";
import { createRoot } from "react-dom/client";
import { View, Text } from "react-native";

AppRegistry.registerComponent("main", () => withExpoRoot(App));
if (Platform.OS === "web") {
  const rootTag = createRoot(
    document.getElementById("root") ?? document.getElementById("main")
  );
  const RootComponent = withExpoRoot(App);
  rootTag.render(<RootComponent />);
  //   rootTag.render(
  //     <View style={{ height: 100, backgroundColor: "red" }}>
  //       <Text style={{ marginTop: 50, marginLeft: 50, color: "white" }}>
  //         test
  //       </Text>
  //     </View>
  //   );
}
