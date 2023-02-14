import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { View, TouchableOpacity, Text } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import styles from "./styles";

function TabBar({
  state,
  descriptors,
  navigation,
  position,
  isDarkMode,
  isHideText = false,
}) {
  const icon = (route) => {
    switch (route?.name) {
      case "Send":
        return "faPaperPlane";
      case "Receive":
        return "faBitcoinSign";
      case "Coins":
        return "faCoins";
      case "Latest":
        return "faPhotoFilm";
      // case "Connect":
      //   return "faHandshake";
      case "Stats":
        return "faChartLine";
      case "Discover":
        return "faEarthAmericas";
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

        const labelBackgroundColor = isDarkMode
          ? COLOURS.black
          : COLOURS.veryLightGrey;

        const labelColor = isFocused
          ? COLOURS.bchGreen
          : isDarkMode
          ? COLOURS.white
          : COLOURS.black;

        const tabStyle = styles({
          labelBackgroundColor,
          isFocused,
          isDarkMode,
          isHideText,
        });

        return (
          <TouchableOpacity
            key={route?.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={tabStyle.wrapper as any}
          >
            {!isHideText && (
              <View style={tabStyle.iconWrapper as any}>
                <FontAwesomeIcon
                  icon={iconImport(icon(route))}
                  size={20}
                  color={labelColor}
                />
              </View>
            )}

            {!isHideText && <Text style={tabStyle.label as any}>{label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TabBar;
