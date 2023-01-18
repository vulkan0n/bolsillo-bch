import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManageWalletsView from "./ManageWalletsView";
import NewWalletView from "./NewWalletView";
import ImportWalletView from "./ImportWalletView";
import WalletView from "./WalletView";
import TransactionsView from "./TransactionsView";
import UTXOsView from "./UTXOsView";
import BackupView from "./BackupView";
import DeleteWalletView from "./DeleteWalletView";
import AddressesView from "./AddressesView";

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
      name="Wallet"
      component={WalletView}
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
      name="UTXOs"
      component={UTXOsView}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Addresses"
      component={AddressesView}
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
