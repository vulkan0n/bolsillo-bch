import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManageWalletsView from "./ManageWalletsView";
import NewWalletView from "./NewWalletView";
import BackupView from "./BackupView";
import ResetWalletView from "./ResetWalletView";

const Stack = createNativeStackNavigator();

const WalletManagerStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Manage"
      component={ManageWalletsView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="New Wallet"
      component={NewWalletView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Backup"
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

export default WalletManagerStack;
