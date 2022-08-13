import { createDrawerNavigator } from "@react-navigation/drawer";
import ToolsHomeView from "./ToolsHomeView";
import DevelopersView from "./DevelopersView";
import SettingsView from "./SettingsView";
import DrawerNavigator from "../../atoms/DrawerNavigator";
import LearnStack from "./LearnStack";
import BackupStack from "./BackupStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Home" component={ToolsHomeView} />
      <Drawer.Screen name="Learn" component={LearnStack} />
      <Drawer.Screen name="Backup" component={BackupStack} />
      <Drawer.Screen name="Developers" component={DevelopersView} />
      <Drawer.Screen name="Settings" component={SettingsView} />
    </DrawerNavigator>
  );
}

export default ToolsDrawerNavigator;
