import { createDrawerNavigator } from "@react-navigation/drawer";
import COLOURS from "../../../../design/colours";
import CommunityView from "../../../views/menu/CommunityView";

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
      <Drawer.Screen name="Community" component={CommunityView} />
      <Drawer.Screen name="Reddit" component={CommunityView} />
      <Drawer.Screen name="Twitter" component={CommunityView} />
    </Drawer.Navigator>
  );
}

export default OnlineDrawerNavigator;
