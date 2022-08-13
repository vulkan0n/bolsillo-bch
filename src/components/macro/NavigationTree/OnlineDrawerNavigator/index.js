import { createDrawerNavigator } from "@react-navigation/drawer";
import COLOURS from "../../../../design/colours";
import OnlineView from "../../../views/OnlineView";

const Drawer = createDrawerNavigator();

function OnlineDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: "front",
        drawerActiveTintColor: COLOURS.bchGreen,
        headerStyle: {
          height: 70, // Specify the height of your custom header
        },
      }}
    >
      <Drawer.Screen name="Community" component={OnlineView} />
      <Drawer.Screen name="Reddit" component={OnlineView} />
      <Drawer.Screen name="Twitter" component={OnlineView} />
    </Drawer.Navigator>
  );
}

export default OnlineDrawerNavigator;
