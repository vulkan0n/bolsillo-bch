import React, { useEffect, useState } from "react";
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
  const availableBalance = 32342;
  const numPadSatBalance = displaySat(0);
  const numPadUsdBalance = displayUsd(0);

  const [inputBalance, setInputBalance] = useState("0");
  const [inputError, setInputError] = useState("");
  const isSatoshiDenominated = true;

  useEffect(() => {
    setTimeout(() => {
      if (inputError) {
        setInputError("");
      }
    }, 2000);
  }, [inputError]);

  function InputButton({ n }) {
    const onPress = () => {
      if (n === "<") {
        handleInputDelete();
      } else {
        handleInput(n);
      }
    };

    const onLongPress = () => {
      if (n === "<") {
        handleInputClear();
      }
    };

    return (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        <Text style={TYPOGRAPHY.h1black}>{n}</Text>
      </Pressable>
    );
  }

  function handleInputDelete() {
    if (inputBalance?.length > 1) {
      setInputBalance(inputBalance?.slice(0, inputBalance?.length - 1));
    } else {
      setInputBalance("0");
    }
  }

  function handleInputClear() {
    setInputBalance("0");
  }

  function handleInput(n) {
    const sats = parseInt(inputBalance + n);
    if (inputBalance === "0") {
      if (n === ".") {
        setInputBalance("0" + n);
      } else {
        setInputBalance(n);
      }
    } else if (sats <= MAX_SATOSHI && sats <= availableBalance) {
      if (n === "." && inputBalance.includes(".")) {
        setInputError("Already used decimal point.");
        return;
      }

      if (inputBalance.includes(".") && n !== ".") {
        const satSplit = inputBalance.split(".");
        const trySats = satSplit[0] + "." + satSplit[1].substring(0, 7) + n;
        setInputBalance(trySats);
      } else {
        setInputBalance(inputBalance + n);
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
          {inputBalance}
          {/* {isCryptoDenominated ? numPadSatBalance : numPadUsdBalance} */}
        </Text>
        <Text style={TYPOGRAPHY.h2black}>
          {" "}
          {isCryptoDenominated ? numPadUsdBalance : numPadSatBalance}
        </Text>
        {!!inputError && <Text style={styles.inputError}>{inputError}</Text>}
      </View>
      <View style={styles.numPad}>
        {/* <InputWidget availableBalance={satoshiBalance} /> */}
        <View style={styles.numPadRow}>
          <InputButton n={"1"} />
          <InputButton n={"2"} />
          <InputButton n={"3"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"4"} />
          <InputButton n={"5"} />
          <InputButton n={"6"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"7"} />
          <InputButton n={"8"} />
          <InputButton n={"9"} />
        </View>
        <View style={styles.numPadRow}>
          <InputButton n={"<"} />
          <InputButton n={"0"} />
          <InputButton n={isSatoshiDenominated ? "" : "."} />
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
