import React, { useState } from "react";
import { View, Text, Button, TouchableHighlight } from "react-native";

//import bchLogo from "@assets/bchLogo.png";
//

const SATOSHI = 100000000;
const MAX_SATOSHI = 21000000 * SATOSHI;

function WalletView() {
  const [inputSatoshi, setInputSatoshi] = useState("0");
  const satoshiBalance = 21.14358274 * SATOSHI;

  function formatSats(sats) {
    return parseFloat(parseInt(sats) / SATOSHI).toFixed(8);
  }

  function handleInputSatoshi(n) {
    console.log("handleInputSatoshi", n, inputSatoshi);
    switch (n) {
      case "X":
        const tryInput = inputSatoshi.substr(0, inputSatoshi.length - 1);
        if (parseFloat(tryInput) >= 0) {
          setInputSatoshi(tryInput);
        } else {
          setInputSatoshi("0");
        }
        break;

      default:
        const sats = parseInt(parseFloat(inputSatoshi + n) * SATOSHI);
        console.log("sats", sats, formatSats(sats));
        if (inputSatoshi === "0") {
          if (n === ".") {
            setInputSatoshi("0" + n);
          } else {
            setInputSatoshi(n);
          }
        } else if (sats <= MAX_SATOSHI && sats <= satoshiBalance) {
          if (inputSatoshi.includes(".") && n !== ".") {
            const satSplit = inputSatoshi.split(".");
            const trySats = satSplit[0] + "." + satSplit[1].substring(0, 7) + n;
            setInputSatoshi(trySats);
          } else {
            setInputSatoshi(inputSatoshi + n);
          }
        }

        break;
    }
  }

  function handleClearSatoshiInput() {
    setInputSatoshi("0");
  }

  return (
    <View>
      <View>
        <Button title="Menu" />
        <Button title="Scan QR Code" />
        <Button title="Transaction History" />
      </View>

      <View>
        <Text>₿ {inputSatoshi}</Text>
      </View>
      <View>
        <Button title="Send" />
        <Button title="Receive" />
      </View>
      <View>
        <SatoshiInputButton n="7" />
        <SatoshiInputButton n="8" />
        <SatoshiInputButton n="9" />
        <SatoshiInputButton n="4" />
        <SatoshiInputButton n="5" />
        <SatoshiInputButton n="6" />
        <SatoshiInputButton n="1" />
        <SatoshiInputButton n="2" />
        <SatoshiInputButton n="3" />
        <SatoshiInputButton n="X" />
        <SatoshiInputButton n="0" />
        <SatoshiInputButton n="." />
      </View>
      <View>
        <Text>₿ {formatSats(satoshiBalance)} Available</Text>
      </View>
    </View>
  );
}

export default WalletView;
