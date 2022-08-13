import { createDrawerNavigator } from "@react-navigation/drawer";
import ToolsHomeView from "./ToolsHomeView";
import CreditsView from "./CreditsView";
import SettingsView from "./SettingsView";
import DrawerNavigator from "../../atoms/DrawerNavigator";
import BackupStack from "./BackupStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Home" component={ToolsHomeView} />
      <Drawer.Screen name="Backup" component={BackupStack} />
      <Drawer.Screen name="Credits" component={CreditsView} />
      <Drawer.Screen name="Settings" component={SettingsView} />
    </DrawerNavigator>
  );
}

export default ToolsDrawerNavigator;
