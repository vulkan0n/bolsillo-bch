import React from "react";
import { Pressable, View, Text } from "react-native";
import TYPOGRAPHY from "@design/typography";
import TextInput from "@atoms/TextInput";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";

const TransactionRow = ({ transaction, editNoteHash, setEditNoteHash }) => {
  const { height, tx_hash, note } = transaction;
  const dispatch = useDispatch();

  const onPressTransaction = () => setEditNoteHash(tx_hash);

  const onChange = (newNote: string) => {
    dispatch(
      updateTransactionNote({
        tx_hash,
        note: newNote,
      })
    );
  };

  const onFinishedEditing = () => setEditNoteHash("");

  const isEditing = editNoteHash === tx_hash;

  return (
    <Pressable onPress={onPressTransaction}>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>Height: {height}</Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>Hash: {tx_hash}</Text>
      {isEditing && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>Note:</Text>
          <TextInput text={note} isSmallText isMultiline onChange={onChange} />
          <Button icon={"faCircleCheck"} onPress={onFinishedEditing}>
            Ok
          </Button>
        </View>
      )}
      {!isEditing && (
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>Note: {note ?? "-"}</Text>
      )}
    </Pressable>
  );
};

export default TransactionRow;
