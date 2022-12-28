import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManageWalletsView from "./ManageWalletsView";
import NewWalletView from "./NewWalletView";
import ImportWalletView from "./ImportWalletView";
import TransactionsView from "./TransactionsView";
import BackupView from "./BackupView";
import DeleteWalletView from "./DeleteWalletView";
import CoinsView from "./CoinsView";

const Stack = createNativeStackNavigator();

const WalletManagerStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Manage"
      component={ManageWalletsView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="New"
      component={NewWalletView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Import"
      component={ImportWalletView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Transactions"
      component={TransactionsView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Coins"
      component={CoinsView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Backup"
      component={BackupView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Delete"
      component={DeleteWalletView}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

export default WalletManagerStack;
