import React from "react";
import StatsView from "./StatsView";
import LatestView from "./LatestView";
import DiscoverView from "./DiscoverView";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TabBar from "@selene-wallet/app/src/components/atoms/TabBar";

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function CommunityTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar isDarkMode {...props} />}
      initialRouteName={"Latest"}
    >
      <Tab.Screen name="Latest" component={LatestView} />
      <Tab.Screen name="Stats" component={StatsView} />
      <Tab.Screen name="Discover" component={DiscoverView} />
    </Tab.Navigator>
  );
}

const CommunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        header: () => false,
      })}
    >
      <Stack.Screen name="Community Tab" component={CommunityTabNavigator} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
