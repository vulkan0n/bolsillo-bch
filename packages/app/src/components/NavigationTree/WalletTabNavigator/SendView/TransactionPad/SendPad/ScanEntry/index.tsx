import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import styles from "./styles";
import { useSelector, useDispatch } from "react-redux";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import { processRequestString } from "../utils";
import { selectPrimaryCurrencyOrDenomination } from "@selene-wallet/app/src/redux/selectors";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { useIsFocused } from "@react-navigation/native";
import Button from "@selene-wallet/app/src/components/atoms/Button";

function QrScanner() {
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const [hasPermission, setHasPermission] = useState(null);
  const [hasPermissionToAsk, setHasPermissionToAsk] = useState(false);
  const isFocused = useIsFocused();

  const requestBarCodeScannerPermissions = async () => {
    setHasPermission(null);
    const { status, canAskAgain } =
      await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
    setHasPermissionToAsk(canAskAgain);
  };

  useEffect(() => {
    if (isFocused && !hasPermission) {
      requestBarCodeScannerPermissions();
    }
  }, [isFocused]);

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
      <Pressable
        style={styles.entryRow as any}
        onPress={requestBarCodeScannerPermissions}
      >
        <Text style={TYPOGRAPHY.h2black as any}>
          Requesting camera permissions.
        </Text>
      </Pressable>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.entryRow as any}>
        <Text style={TYPOGRAPHY.h2black as any}>
          No permission to access QR scanner camera.
          {!hasPermissionToAsk &&
            " Go to the Settings app on your device, choose Apps, choose Selene and enable Camera permission to scan QR codes."}
        </Text>
        {hasPermissionToAsk && (
          <Button
            icon={"faCamera"}
            size="small"
            onPress={requestBarCodeScannerPermissions}
          >
            Enable camera
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.entryRow as any}>
      <View style={styles.container as any}>
        {/* NB: BarCodeScanner doesn't work on iOS simulator or Android emulator. */}
        {/* Instead it will be just the grey background block. */}
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={styles.qrScanner as any}
        />
      </View>
    </View>
  );
}

export default QrScanner;
