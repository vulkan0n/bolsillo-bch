import { createDrawerNavigator } from "@react-navigation/drawer";
import COLOURS from "@selene/common/design/colours";
import TYPOGRAPHY from "@selene/common/design/typography";
import { getHeaderTitle } from "@react-navigation/elements";
import { View, Text, Pressable } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene/app/src/design/icons";
import styles from "./styles";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene/app/src/types";

const Drawer = createDrawerNavigator();

function DrawerNavigator({ children }) {
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: "front",
        drawerLabelStyle: styles.drawerLabelStyle as any,
        drawerActiveTintColor: COLOURS.bchGreen,
        drawerContentStyle: styles.drawerContentStyle as any,
        drawerPosition: isRightHandedMode ? "right" : "left",
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);

          const DrawerButton = (
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
          );

          const Spacer = <View style={styles.spacer as any}></View>;

          return (
            <View style={styles.headerContainer as any}>
              {isRightHandedMode ? Spacer : DrawerButton}
              <View style={styles.titleContentContainer as any}>
                <Text style={TYPOGRAPHY.h1 as any}>{title}</Text>
              </View>
              {isRightHandedMode ? DrawerButton : Spacer}
            </View>
          );
        },
        headerStyle: styles.headerStyle,
      }}
    >
      {children}
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
