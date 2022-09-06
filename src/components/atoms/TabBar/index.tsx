import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { View, TouchableOpacity, Text } from "react-native";
import COLOURS from "@design/colours";
import { iconImport } from "@design/icons";
import TYPOGRAPHY from "@design/typography";
import SPACING from "../../../design/spacing";

function TabBar({ state, descriptors, navigation, position, isDarkMode }) {
  const icon = (route) => {
    switch (route?.name) {
      case "Send":
        return "faPaperPlane";
      case "Receive":
        return "faBitcoinSign";
      default:
        return "faBitcoinSign";
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route?.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              backgroundColor: isDarkMode
                ? COLOURS.black
                : COLOURS.veryLightGrey,
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: SPACING.five,
              height: 50,
            }}
          >
            <View
              style={{
                marginRight: SPACING.five,
                justifyContent: "center",
              }}
            >
              <FontAwesomeIcon
                icon={iconImport(icon(route))}
                size={20}
                color={
                  isFocused
                    ? COLOURS.bchGreen
                    : isDarkMode
                    ? COLOURS.white
                    : COLOURS.black
                }
              />
            </View>

            <Text
              style={{
                ...TYPOGRAPHY.p,
                marginBottom: 0,
                color: isFocused
                  ? COLOURS.bchGreen
                  : isDarkMode
                  ? COLOURS.white
                  : COLOURS.black,
                marginLeft: SPACING.five,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TabBar;
