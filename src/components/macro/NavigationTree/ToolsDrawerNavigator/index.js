import { createDrawerNavigator } from "@react-navigation/drawer";
import COLOURS from "../../../../design/colours";
import LearnView from "../../../views/menu/LearnView";
import BackupView from "../../../views/menu/BackupView";
import SettingsView from "../../../views/menu/SettingsView";
import TYPOGRAPHY from "../../../../design/typography";
import { getHeaderTitle } from "@react-navigation/elements";
import { View, Text, Pressable } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../../design/icons";
import SPACING from "../../../../design/spacing";

const Drawer = createDrawerNavigator();

function ToolsDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: "front",
        drawerLabelStyle: {
          color: COLOURS.white,
          ...TYPOGRAPHY.pWhiteLeft,
        },
        drawerActiveTintColor: COLOURS.bchGreen,
        drawerContentStyle: {
          backgroundColor: COLOURS.black,
        },
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);

          return (
            <View
              style={{
                height: 50,
                backgroundColor: COLOURS.black,
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexDirection: "row",
              }}
            >
              <Pressable
                style={{
                  height: "100%",
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingLeft: SPACING.ten,
                }}
                onPress={() => navigation.openDrawer()}
              >
                <FontAwesomeIcon
                  icon={iconImport("faBarsStaggered")}
                  size={30}
                  color={COLOURS.bchGreen}
                />
              </Pressable>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={iconImport("faBookOpenReader")}
                  size={20}
                  color={COLOURS.white}
                  style={{
                    marginRight: SPACING.ten,
                    marginBottom: SPACING.ten,
                  }}
                />
                <Text style={TYPOGRAPHY.h1}>{title}</Text>
              </View>
              <View style={{ width: 50 }}></View>
            </View>
          );
        },
        headerStyle: {
          height: 50, // Specify the height of your custom header
        },
      }}
    >
      <Drawer.Screen name="Learn" component={LearnView} />
      <Drawer.Screen name="Backup" component={BackupView} />
      <Drawer.Screen name="Settings" component={SettingsView} />
    </Drawer.Navigator>
  );
}

export default ToolsDrawerNavigator;
