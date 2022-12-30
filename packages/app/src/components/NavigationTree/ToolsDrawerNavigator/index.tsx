import { createDrawerNavigator } from "@react-navigation/drawer";
import CreditsView from "./CreditsView";
import DrawerNavigator from "@selene-wallet/app/src/components/atoms/DrawerNavigator";
import SettingsStack from "./SettingsStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Settings" component={SettingsStack} />
      <Drawer.Screen name="Credits" component={CreditsView} />
    </DrawerNavigator>
  );
}

export default ToolsDrawerNavigator;
