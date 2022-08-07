import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Button from "../../../../atoms/Button";
import Toast from "react-native-toast-message";
import ACTION_TYPES from "../../../../../redux/actionTypes";

const ReceivePad = ({ dispatch }) => {
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
    dispatch({
      type: ACTION_TYPES.UPDATE_TRANSACTION_PAD_STATE,
      payload: {
        transactionPadState: "",
      },
    });
  };

  return (
    <View style={styles.inputBackground}>
      <View style={styles.receivePad}></View>
      <View style={styles.buttonContainer}>
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

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch) => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(ReceivePad);
