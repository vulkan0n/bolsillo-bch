import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DrawerNavigator from "@atoms/DrawerNavigator";
import RoadmapView from "./RoadmapView";
import NewView from "./NewView";
import LatestView from "./LatestView";
import ConnectView from "./ConnectView";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TabBar from "@atoms/TabBar";

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

function CommunityTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar isDarkMode {...props} />}
      initialRouteName={"Latest"}
    >
      {/* <Tab.Screen name="New" component={NewView} /> */}
      <Tab.Screen name="Latest" component={LatestView} />
      <Tab.Screen name="Connect" component={ConnectView} />
      {/* <Tab.Screen name="Connect" component={RoadmapView} />
      <Tab.Screen name="Stats" component={RoadmapView} />
      <Tab.Screen name="Learn" component={RoadmapView} /> */}
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
      <Stack.Screen name="Wallet Home" component={CommunityTabNavigator} />
      <Stack.Screen name="Receive Num Pad" component={CommunityTabNavigator} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
