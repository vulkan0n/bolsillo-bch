import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverHomeView from "./DiscoverHomeView";
import CategoryView from "./CategoryView";
import ItemView from "./ItemView";

const Stack = createNativeStackNavigator();

export interface DiscoverCategory {
  name: string;
  description: string;
  items: DiscoverItem[];
}

export interface DiscoverItem {
  name: string;
  description: string;
  url: string;
}

const DiscoverStack = () => {
  return (
    <>
      <Stack.Navigator
        screenOptions={({ route }) => ({
          header: () => false,
        })}
      >
        <Stack.Screen name="Discover Home" component={DiscoverHomeView} />
        <Stack.Screen name="Discover Category" component={CategoryView} />
        <Stack.Screen name="Discover Item" component={ItemView} />
      </Stack.Navigator>
    </>
  );
};

export default DiscoverStack;
