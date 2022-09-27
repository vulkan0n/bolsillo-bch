import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import TYPOGRAPHY from "@design/typography";
import Button from "@atoms/Button";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { COLOURS } from "@selene/common";
import { MotiView } from "moti";
import { iconImport } from "@design/icons";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";
import { updateLocalLastSentTransactionHash } from "@redux/reducers/localReducer";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "@atoms/TextInput";
import { ReduxState } from "@types";

function TransactionSuccessModal({ navigation }) {
  // Temporary storage of this text
  const [noteText, setNoteText] = useState("");
  const dispatch = useDispatch();

  const { lastSentTransactionHash } = useSelector(
    (state: ReduxState) => state.local
  );

  // Clear last sent transaction hash on unmounting
  useEffect(() => {
    return () => {
      dispatch(
        updateLocalLastSentTransactionHash({
          lastSentTransactionHash: "",
        })
      );
    };
  }, []);

  const onPressOk = () => {
    navigation.navigate("Tab Navigator");
  };

  const onChange = (newNote: string) => {
    setNoteText(newNote);
    dispatch(
      updateTransactionNote({
        txn: lastSentTransactionHash,
        note: newNote,
      })
    );
  };

  return (
    <Pressable onPress={onPressOk} style={styles.container as any}>
      <MotiView
        from={{ opacity: 0, translateY: 35 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1200 }}
        style={styles.motiView as any}
      >
        <View style={styles.contentWrapper as any}>
          <View style={styles.iconWrapper as any}>
            <FontAwesomeIcon
              icon={iconImport("faCircleCheck")}
              size={120}
              color={COLOURS.white}
            />
          </View>
          <Text style={TYPOGRAPHY.h1 as any}>Sent!</Text>
          {/* <Text style={TYPOGRAPHY.h2 as any}>Note:</Text> */}
          {/* <View style={styles.objectWrapper as any}>
            <TextInput
              text={noteText}
              isSmallText
              isMultiline
              numberOfLines={5}
              onChange={onChange}
            />
          </View> */}
          <View style={styles.objectWrapper as any}>
            <Button
              icon={"faCircleCheck"}
              onPress={onPressOk}
              variant={"secondaryOnGreen"}
            >
              Ok
            </Button>
          </View>
        </View>
      </MotiView>
    </Pressable>
  );
}

export default TransactionSuccessModal;
