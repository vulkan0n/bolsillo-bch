import { StyleSheet, View } from 'react-native';
import WalletView from "./components/views/WalletView.jsx";

export default function AppMain() {
  return (
    <View style={styles.container}>
      <WalletView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
