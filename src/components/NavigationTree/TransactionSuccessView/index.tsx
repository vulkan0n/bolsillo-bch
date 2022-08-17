import React, { useEffect } from "react";
import { View, Text } from "react-native";
import TYPOGRAPHY from "../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import COLOURS from "../../../design/colours";
import { MotiView } from "moti";
import { useDispatch } from "react-redux";
import { updateBridgeTempTxId } from "../../../redux/reducers/bridgeReducer";

function TransactionSuccessView({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(
        updateBridgeTempTxId({
          tempTxId: "",
        })
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "Tab Navigator" }],
      });
    }, 3000);
  }, []);

  return (
    <View style={styles.container as any}>
      <MotiView
        from={{ opacity: 0, translateY: 35 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1200 }}
      >
        <View style={styles.iconWrapper as any}>
          <FontAwesomeIcon
            icon={faCircleCheck}
            size={150}
            color={COLOURS.black}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text style={TYPOGRAPHY.h1 as any}>Sent!</Text>
        </View>
      </MotiView>
    </View>
  );
}

export default TransactionSuccessView;
