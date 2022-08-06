import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { connect } from "react-redux";
import TYPOGRAPHY from "../../../design/typography";
import Button from "../../../components/atoms/Button";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";

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

function WalletView({ wallet, balance, route, navigation }) {
  const { emit } = route.params;

  useEffect(() => {
    if (!wallet) {
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: null });
    }
  }, []);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    emit({ type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE, data: null });
  }, [wallet]);

  const onPressBalance = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
      },
    });
  };

  const onPressSend = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
      },
    });
  };

  const mBchBalance = balance?.sat / 100000 ?? 0;

  const displayUsd = (stringVal) => {
    if (!stringVal) {
      return "USD $0.00";
    }

    return `USD $${Number(stringVal).toFixed(2)}`;
  };

  const displaySat = (stringVal) => {
    if (!stringVal) {
      return "0 satoshis";
    }

    return `${Number(stringVal)} sats`;
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          navigation.navigate("Menu");
        }}
      >
        <Image
          style={styles.logo}
          source={require("../../../assets/images/logo.jpg")}
        />
      </Pressable>

      {/*<View>
        <Button title="Scan QR Code" />
        <Button title="Transaction History" />
      </View>*/}

      <Pressable onPress={onPressBalance} style={styles.widePressable}>
        <View style={styles.primaryTitlesWrapper}>
          {/* <Text style={TYPOGRAPHY.h1}>
          ₿ {formatSats(satoshiBalance)} Available
        </Text> */}
          <Text style={TYPOGRAPHY.h1}>{displaySat(balance?.sat)}</Text>
          <Text style={TYPOGRAPHY.h2}>{displayUsd(balance?.usd)}</Text>
        </View>
      </Pressable>

      <View style={styles.inputBackground}>
        <View style={styles.secondaryTitlesWrapper}>
          <Text style={TYPOGRAPHY.h1black}>0 mBCH</Text>
          <Text style={TYPOGRAPHY.h2black}>USD $0</Text>
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
    </View>
  );
}

const mapStateToProps = ({ wallet, balance }) => ({
  wallet,
  balance,
});

export default connect(mapStateToProps)(WalletView);
