import { createDrawerNavigator } from "@react-navigation/drawer";
import COLOURS from "../../../../design/colours";
import ToolsHomeView from "../../../views/ToolsView/ToolsHomeView";
import SettingsView from "../../../views/ToolsView/SettingsView";
import TYPOGRAPHY from "../../../../design/typography";
import { getHeaderTitle } from "@react-navigation/elements";
import { View, Text, Pressable } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../../design/icons";
import styles from "./styles";
import LearnStack from "./LearnStack";
import BackupStack from "./BackupStack";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: "front",
        drawerLabelStyle: styles.drawerLabelStyle as any,
        drawerActiveTintColor: COLOURS.bchGreen,
        drawerContentStyle: styles.drawerContentStyle as any,
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <View style={styles.headerContainer as any}>
              <Pressable
                style={styles.drawerButton as any}
                onPress={() => navigation.openDrawer()}
              >
                <FontAwesomeIcon
                  icon={iconImport("faBarsStaggered")}
                  size={30}
                  color={COLOURS.bchGreen}
                />
              </Pressable>
              <View style={styles.titleContentContainer as any}>
                {/* <FontAwesomeIcon
                  icon={iconImport("faBookOpenReader")}
                  size={20}
                  color={COLOURS.white}
                  style={{
                    marginRight: SPACING.ten,
                    marginBottom: SPACING.ten,
                  }}
                /> */}
                <Text style={TYPOGRAPHY.h1 as any}>{title}</Text>
              </View>
              <View style={styles.spacer as any}></View>
            </View>
          );
        },
        headerStyle: styles.headerStyle,
      }}
    >
      <Drawer.Screen name="Home" component={ToolsHomeView} />
      <Drawer.Screen name="Learn" component={LearnStack} />
      <Drawer.Screen name="Backup" component={BackupStack} />
      <Drawer.Screen name="Settings" component={SettingsView} />
    </Drawer.Navigator>
  );
}

export default ToolsDrawerNavigator;
