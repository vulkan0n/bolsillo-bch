import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import styles from "./styles";
import { useDispatch } from "react-redux";
import {
  updateTransactionPadSendToAddress,
  updateTransactionPadView,
} from "../../../../../../redux/reducers/transactionPadReducer";
import { isValidBchAddress } from "../../../../../../utils/utils";

function QrScanner() {
  const dispatch = useDispatch();
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    const isBchAddress = isValidBchAddress(data);
    if (isBchAddress) {
      dispatch(updateTransactionPadSendToAddress({ sendToAddress: data }));
      dispatch(
        updateTransactionPadView({
          view: "Confirm",
        })
      );
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container as any}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={styles.qrScanner as any}
      />
    </View>
  );
}

export default QrScanner;
