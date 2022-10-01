import { createDrawerNavigator } from "@react-navigation/drawer";
import CreditsView from "./CreditsView";
import DrawerNavigator from "@selene/app/src/components/atoms/DrawerNavigator";
import WalletManagerStack from "./WalletManagerStack";
import SettingsStack from "./SettingsStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Wallets" component={WalletManagerStack} />
      <Drawer.Screen name="Credits" component={CreditsView} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </DrawerNavigator>
  );
}

export default ToolsDrawerNavigator;
