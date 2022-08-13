import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "../../../../../design/typography";
import QRCode from "react-qr-code";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "../../../../../redux/reducers/transactionPadReducer";
import { ReduxState } from "../../../../../types";

const ReceivePad = () => {
  const dispatch = useDispatch();
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const onPressShare = () => {
    Toast.show({
      type: "customError",
      props: {
        title: "TODO",
        text: "Implement share feature",
      },
    });
  };

  const onPressBack = () => {
    dispatch(
      updateTransactionPadView({
        view: "",
      })
    );
  };

  const ShareButton = (
    <Button onPress={onPressShare} isSmall>
      Share
    </Button>
  );

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.receivePad as any}>
        <View style={styles.qrBorder}>
          <QRCode size={200} value={`${wallet?.cashaddr}`} />
        </View>
        <Text selectable style={TYPOGRAPHY.p as any}>
          {wallet?.cashaddr}
        </Text>
      </View>
      <View style={styles.buttonContainer as any}>
        {isRightHandedMode && ShareButton}
        <Button
          icon={"faChevronLeft"}
          variant="secondary"
          onPress={onPressBack}
          isSmall
        >
          Back
        </Button>
        {!isRightHandedMode && ShareButton}
      </View>
    </View>
  );
};

export default ReceivePad;
