import React, { useState } from "react";
import { View, Text, Pressable, Button } from "react-native";

//import bchLogo from "@assets/bchLogo.png";
//

const SATOSHI = 100000000;
const MAX_SATOSHI = 21000000 * SATOSHI;

function formatSats(sats) {
  return parseFloat(parseInt(sats) / SATOSHI).toFixed(8);
}

function SatoshiInputWidget({ availableBalance }) {
  const [inputSatoshi, setInputSatoshi] = useState("0");

  function SatoshiInputButton({ n }) {
    const onPress = () => {
      if (n === "X") {
        handleSatoshiInputDelete();
      } else {
        handleSatoshiInput(n);
      }
    };

    const onLongPress = () => {
      if (n === "X") {
        handleSatoshiInputClear();
      }
    };

    return (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        <View>
          <Text>{n}</Text>
        </View>
      </Pressable>
    );
  }

  function handleSatoshiInputDelete() {
    const tryInput = inputSatoshi.substr(0, inputSatoshi.length - 1);
    if (parseFloat(tryInput) >= 0) {
      setInputSatoshi(tryInput);
    } else {
      setInputSatoshi("0");
    }
  }

  function handleSatoshiInputClear() {
    setInputSatoshi("0");
  }

  function handleSatoshiInput(n) {
    const sats = parseInt(parseFloat(inputSatoshi + n) * SATOSHI);
    if (inputSatoshi === "0") {
      if (n === ".") {
        setInputSatoshi("0" + n);
      } else {
        setInputSatoshi(n);
      }
    } else if (sats <= MAX_SATOSHI && sats <= availableBalance) {
      if (inputSatoshi.includes(".") && n !== ".") {
        const satSplit = inputSatoshi.split(".");
        const trySats = satSplit[0] + "." + satSplit[1].substring(0, 7) + n;
        setInputSatoshi(trySats);
      } else {
        setInputSatoshi(inputSatoshi + n);
      }
    }
  }

  return (
    <View>
      <View>
        <Text>₿ {inputSatoshi}</Text>
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
    </View>
  );
}

function WalletView() {
  const satoshiBalance = 21.14358274 * SATOSHI;

  return (
    <View>
      {/*<View>
        <Button title="Menu" />
        <Button title="Scan QR Code" />
        <Button title="Transaction History" />
      </View>*/}

      <SatoshiInputWidget availableBalance={satoshiBalance} />

      <View>
        <Button title="Send" />
        <Button title="Receive" />
      </View>

      <View>
        <Text>₿ {formatSats(satoshiBalance)} Available</Text>
      </View>
    </View>
  );
}

export default WalletView;
