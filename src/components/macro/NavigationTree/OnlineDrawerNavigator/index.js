import { createDrawerNavigator } from "@react-navigation/drawer";
import DrawerNavigator from "../../../atoms/DrawerNavigator";
import OnlineView from "../../../views/OnlineView";

const Drawer = createDrawerNavigator();

function OnlineDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Community" component={OnlineView} />
      <Drawer.Screen name="Reddit" component={OnlineView} />
      <Drawer.Screen name="Twitter" component={OnlineView} />
    </DrawerNavigator>
  );
}

export default OnlineDrawerNavigator;
