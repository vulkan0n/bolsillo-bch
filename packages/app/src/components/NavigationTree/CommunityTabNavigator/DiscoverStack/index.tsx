import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverHomeView from "./DiscoverHomeView";
import CategoryView from "./CategoryView";

const Stack = createNativeStackNavigator();

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
      </Stack.Navigator>
    </>
  );
};

export default DiscoverStack;
