import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OptionsView from "./OptionsView";
import DenominationView from "./DenominationView";
import ResetView from "./ResetView";
import ContrastCurrencyView from "./ContrastCurrencyView";

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
      name="Contrast Currency"
      component={ContrastCurrencyView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Denomination"
      component={DenominationView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Reset"
      component={ResetView}
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
