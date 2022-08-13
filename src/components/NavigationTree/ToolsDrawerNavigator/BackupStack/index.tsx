import { createDrawerNavigator } from "@react-navigation/drawer";
import BackupView from "./BackupView";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ResetWalletView from "./ResetWalletView";

const Stack = createNativeStackNavigator();

const BackupStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Mnemonic"
      component={BackupView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Reset"
      component={ResetWalletView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
      }}
    />
  </Stack.Navigator>
);

export default BackupStack;
