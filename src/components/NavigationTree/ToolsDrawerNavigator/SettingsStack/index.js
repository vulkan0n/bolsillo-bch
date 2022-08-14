import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OptionsView from "./OptionsView";
import ResetAppView from "./ResetAppView";

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Options"
      component={OptionsView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Reset App"
      component={ResetAppView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
  </Stack.Navigator>
);

export default SettingsStack;
