import React, { useEffect } from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { connect } from "react-redux";
import ACTION_TYPES from "../../../../redux/actionTypes";

function TransactionSuccessView({ tempTxId, navigation, dispatch }) {
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: ACTION_TYPES.UPDATE_TEMP_TXID,
        payload: {
          tempTxId: "",
        },
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Wallet" }],
      });
    }, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1}>Transaction success!</Text>
      <Text style={TYPOGRAPHY.h1}>{tempTxId}</Text>
    </View>
  );
}

const mapStateToProps = ({ tempTxId }) => ({ tempTxId });

const mapDispatchToProps = (dispatch) => dispatch;

export default connect(mapStateToProps)(TransactionSuccessView);
