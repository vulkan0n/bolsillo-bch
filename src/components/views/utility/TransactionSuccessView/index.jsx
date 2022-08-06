import React, { useEffect } from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { connect } from "react-redux";
import ACTION_TYPES from "../../../../redux/actionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import COLOURS from "../../../../design/colours";

function TransactionSuccessView({ tempTxId, navigation, dispatch }) {
  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: ACTION_TYPES.UPDATE_TEMP_TXID,
        payload: {
          tempTxId: "",
        },
      });

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Wallet" }],
      // });
    }, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <FontAwesomeIcon
          icon={faCircleCheck}
          size={150}
          color={COLOURS.black}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={TYPOGRAPHY.h1}>Sent!</Text>
      </View>
      {/* <Text style={TYPOGRAPHY.h1}>{tempTxId}</Text> */}
    </View>
  );
}

const mapStateToProps = ({ tempTxId }) => ({ tempTxId });

const mapDispatchToProps = (dispatch) => dispatch;

export default connect(mapStateToProps)(TransactionSuccessView);
