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

const HEADER_HEIGHT = 60;

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
                height: HEADER_HEIGHT,
                backgroundColor: COLOURS.black,
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexDirection: "row",
                borderColor: COLOURS.white,
                borderBottomWidth: 1,
                paddingLeft: SPACING.fifteen,
                paddingRight: SPACING.fifteen,
              }}
            >
              <Pressable
                style={{
                  height: "100%",
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
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
          height: HEADER_HEIGHT, // Specify the height of your custom header
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
