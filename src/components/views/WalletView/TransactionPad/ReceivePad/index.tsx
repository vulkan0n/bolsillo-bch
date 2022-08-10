import React from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import Toast from "react-native-toast-message";
import TYPOGRAPHY from "../../../../../design/typography";
import QRCode from "react-qr-code";
import { useDispatch } from "react-redux";
import { updateTransactionPadView } from "../../../../../redux/reducers/transactionPadReducer";

const ReceivePad = ({ wallet }) => {
  const dispatch = useDispatch();

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

  return (
    <View style={styles.inputBackground as any}>
      <View style={styles.receivePad}>
        <View style={styles.qrBorder}>
          <QRCode value={`${wallet?.cashaddr}`} />
        </View>
        <Text selectable style={TYPOGRAPHY.p}>
          {wallet?.cashaddr}
        </Text>
      </View>
      <View style={styles.buttonContainer as any}>
        <Button onPress={onPressShare} isSmall>
          Share
        </Button>
        <Button variant="secondary" onPress={onPressBack} isSmall>
          Back
        </Button>
      </View>
    </View>
  );
};

const mapStateToProps = ({ root: { wallet } }) => ({ wallet });

export default connect(mapStateToProps)(ReceivePad);
