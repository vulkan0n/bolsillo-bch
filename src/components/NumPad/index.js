import React from "react";
import { View, Text } from "react-native";
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

const NumPad = ({ isCryptoDenominated, navigation }) => {
  const numPadSatBalance = displaySat(0);
  const numPadUsdBalance = displayUsd(0);

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
          <Text style={TYPOGRAPHY.h1black}>1</Text>
          <Text style={TYPOGRAPHY.h1black}>2</Text>
          <Text style={TYPOGRAPHY.h1black}>3</Text>
        </View>
        <View style={styles.numPadRow}>
          <Text style={TYPOGRAPHY.h1black}>4</Text>
          <Text style={TYPOGRAPHY.h1black}>5</Text>
          <Text style={TYPOGRAPHY.h1black}>6</Text>
        </View>
        <View style={styles.numPadRow}>
          <Text style={TYPOGRAPHY.h1black}>7</Text>
          <Text style={TYPOGRAPHY.h1black}>8</Text>
          <Text style={TYPOGRAPHY.h1black}>9</Text>
        </View>
        <View style={styles.numPadRow}>
          <Text style={TYPOGRAPHY.h1black}>{"<"}</Text>
          <Text style={TYPOGRAPHY.h1black}>0</Text>
          <Text style={TYPOGRAPHY.h1black}>.</Text>
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
