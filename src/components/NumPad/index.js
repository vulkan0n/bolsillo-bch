import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../atoms/Button";
import TYPOGRAPHY from "../../design/typography";
import { displaySat, displayUsd } from "../../utils/formatting";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";

const SATOSHI = 100000000;
const MAX_SATOSHI = 21000000 * SATOSHI;

function formatSats(sats) {
  return parseFloat(parseInt(sats) / SATOSHI).toFixed(8);
}

const NumPad = ({ isCryptoDenominated, navigation }) => {
  const availableBalance = 3.2342;
  const numPadSatBalance = displaySat(0);
  const numPadUsdBalance = displayUsd(0);

  const [inputSatoshi, setInputSatoshi] = useState("0");

  function InputButton({ n }) {
    const onPress = () => {
      if (n === "<") {
        handleSatoshiInputDelete();
      } else {
        handleSatoshiInput(n);
      }
    };

    const onLongPress = () => {
      if (n === "<") {
        handleSatoshiInputClear();
      }
    };

    return (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        <Text style={TYPOGRAPHY.h1black}>{n}</Text>
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

  const onPressSend = () => {
    const testNetFaucet = "bchtest:qzl7ex0q35q2d6aljhlhzwramp09n06fry8ssqu0qp";
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: testNetFaucet,
        satsToSend: "100",
      },
    });
  };

  return (
    <View style={styles.inputBackground}>
      <View style={styles.secondaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1black}>
          {isCryptoDenominated ? numPadSatBalance : numPadUsdBalance}
        </Text>
        <Text style={TYPOGRAPHY.h2black}>
          {" "}
          {isCryptoDenominated ? numPadUsdBalance : numPadSatBalance}
        </Text>
      </View>
      <View style={styles.numPad}>
        {/* <SatoshiInputWidget availableBalance={satoshiBalance} /> */}
        <View style={styles.numPadRow}>
          <InputButton n={1} />
          <InputButton n={2} />
          <InputButton n={3} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={4} />
          <InputButton n={5} />
          <InputButton n={6} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={7} />
          <InputButton n={8} />
          <InputButton n={9} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"<"} />
          <InputButton n={0} />
          <InputButton n={"."} />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={onPressSend} isSmall>
          Send
        </Button>
        <Button variant="secondary" isSmall>
          Receive
        </Button>
      </View>
    </View>
  );
};
const mapStateToProps = ({ isCryptoDenominated }) => ({
  isCryptoDenominated,
});

export default connect(mapStateToProps)(NumPad);
