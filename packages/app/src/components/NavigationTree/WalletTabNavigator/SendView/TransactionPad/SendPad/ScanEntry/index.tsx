import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import styles from "./styles";
import { useSelector, useDispatch } from "react-redux";
import { TYPOGRAPHY } from "@selene/common";
import { processRequestString } from "../utils";
import { selectPrimaryCurrencyOrDenomination } from "@redux/selectors";
import { ReduxState } from "@types";

function QrScanner() {
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const [hasPermission, setHasPermission] = useState(null);

  const requestBarCodeScannerPermissions = async () => {
    setHasPermission(null);
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  useEffect(() => {
    requestBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    processRequestString({
      dispatch,
      primaryCurrency,
      requestString: data,
      isTestNet,
    });
  };

  if (hasPermission === null) {
    return (
      <Pressable onPress={requestBarCodeScannerPermissions}>
        <Text style={TYPOGRAPHY.h2black as any}>
          Requesting camera permissions.
        </Text>
      </Pressable>
    );
  }

  if (hasPermission === false) {
    return (
      <Pressable onPress={requestBarCodeScannerPermissions}>
        <Text style={TYPOGRAPHY.h2black as any}>
          No permission to access QR scanner camera. Tap to enable.
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.entryRow as any}>
      <View style={styles.container as any}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={styles.qrScanner as any}
        />
      </View>
    </View>
  );
}

export default QrScanner;
