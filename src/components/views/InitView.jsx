import React from "react";
import { View, Button, Text } from "react-native";

//import bchLogo from "@assets/bchLogo.png";

function InitView() {
  return (
    <View>
      {/*<img alt="BitcoinCash" src={bchLogo} />*/}
      <View>
        <Button title="New Wallet" />
        <Button title="Restore Wallet" />
        <Text>Help me decide</Text>
      </View>
    </View>
  )
}
export default InitView;
