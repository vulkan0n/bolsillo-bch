import React from "react";
import { View, Button } from "react-native";

//import bchLogo from "@assets/bchLogo.png";

function InitView() {
  return (
    <View>
      {/*<img alt="BitcoinCash" src={bchLogo} />*/}
      <View>
        <Button title="New Wallet" />
        <Button title="Restore Wallet" />
      </View>
    </View>
  )
}
export default InitView;
