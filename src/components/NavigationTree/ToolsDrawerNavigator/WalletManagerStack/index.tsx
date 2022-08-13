import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManageWalletsView from "./ManageWalletsView";
import NewWalletView from "./NewWalletView";
import ImportWalletView from "./ImportWalletView";
import BackupView from "./BackupView";
import DeleteWalletView from "./DeleteWalletView";

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
      name="New"
      component={NewWalletView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
        headerTitle: (props) => null,
      }}
    />
    <Stack.Screen
      name="Import"
      component={ImportWalletView}
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
      name="Delete"
      component={DeleteWalletView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
      }}
    />
  </Stack.Navigator>
);

export default WalletManagerStack;
