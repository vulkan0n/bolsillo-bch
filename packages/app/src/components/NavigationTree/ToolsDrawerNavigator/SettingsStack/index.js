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
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Contrast Currency"
      component={ContrastCurrencyView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Denomination"
      component={DenominationView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Reset"
      component={ResetView}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

export default SettingsStack;
