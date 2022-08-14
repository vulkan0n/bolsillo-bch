import { createDrawerNavigator } from "@react-navigation/drawer";
import ToolsHomeView from "./ToolsHomeView";
import CreditsView from "./CreditsView";
import DrawerNavigator from "../../atoms/DrawerNavigator";
import WalletManagerStack from "./WalletManagerStack";
import SettingsStack from "./SettingsStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Home" component={ToolsHomeView} />
      <Drawer.Screen name="Wallets" component={WalletManagerStack} />
      <Drawer.Screen name="Credits" component={CreditsView} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </DrawerNavigator>
  );
}

export default ToolsDrawerNavigator;
