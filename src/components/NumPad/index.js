import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../atoms/Button";
import TYPOGRAPHY from "../../design/typography";
import { displaySats, displaySatsAsUsd } from "../../utils/formatting";
import { BRIDGE_MESSAGE_TYPES } from "../../utils/bridgeMessages";

const NumPad = ({ isCryptoDenominated, balance, navigation }) => {
  const [inputBalance, setInputBalance] = useState("0");
  const [inputError, setInputError] = useState("");
  const isSatoshiDenominated = true;
  const availableBalance = balance?.sat;
  console.log({ balance });

  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

  useEffect(() => {
    setTimeout(() => {
      if (inputError) {
        setInputError("");
      }
    }, 2000);
  }, [inputError]);

  const onPress = (n) => {
    if (n === "<") {
      if (inputBalance?.length > 1) {
        setInputBalance(inputBalance?.slice(0, inputBalance?.length - 1));
      } else {
        setInputBalance("0");
      }
      return;
    }
    if (n === "." && inputBalance.includes(".")) {
      setInputError("Already used decimal point.");
      return;
    }

    if (parseFloat(inputBalance + n) > parseFloat(availableBalance)) {
      setInputError("Insuffient balance.");
      return;
    }

    if (inputBalance === "0") {
      setInputBalance(n);
    } else {
      setInputBalance(inputBalance + n);
    }
  };

  const onLongPress = ({ n }) => {
    if (n === "<") {
      setInputBalance("0");
    }
  };

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

  const InputButton = ({ n }) => {
    return (
      <Pressable
        style={styles.inputButton}
        onPress={() => onPress(n)}
        onLongPress={() => onLongPress(n)}
      >
        <Text style={TYPOGRAPHY.h1black}>{n}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.inputBackground}>
      <View style={styles.secondaryTitlesWrapper}>
        <Text style={TYPOGRAPHY.h1black}>
          {inputBalance} sats
          {/* {isCryptoDenominated ? satBalance : usdBalance} */}
        </Text>
        <Text style={TYPOGRAPHY.h2black}>
          {" "}
          {isCryptoDenominated ? usdBalance : satBalance}
        </Text>
        {!!inputError && <Text style={styles.inputError}>{inputError}</Text>}
      </View>
      <View style={styles.numPad}>
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
const mapStateToProps = ({ balance, isCryptoDenominated }) => ({
  balance,
  isCryptoDenominated,
});

export default connect(mapStateToProps)(NumPad);
