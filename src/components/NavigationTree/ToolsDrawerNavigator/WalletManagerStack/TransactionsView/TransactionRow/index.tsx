import React from "react";
import { Pressable, View, Text, Linking } from "react-native";
import TYPOGRAPHY from "@design/typography";
import TextInput from "@atoms/TextInput";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";

const TransactionRow = ({ transaction, editNoteHash, setEditNoteHash }) => {
  const { blockheight, txn, note } = transaction;
  const dispatch = useDispatch();

  const blockchairUrl = `https://blockchair.com/bitcoin-cash/transaction/${txn}`;

  const onPressTransactionHash = async () => {
    Linking.openURL(blockchairUrl);
  };

  const onPressNote = () => setEditNoteHash(txn);

  const onChange = (newNote: string) => {
    dispatch(
      updateTransactionNote({
        txn,
        note: newNote,
      })
    );
  };

  const onFinishedEditing = () => setEditNoteHash("");

  const isEditing = editNoteHash === txn;

  https: return (
    <View>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>
        Height: {blockheight >= 1 ? blockheight : "Unconfirmed"}
      </Text>
      <Pressable onPress={onPressTransactionHash}>
        <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Hash: {txn}</Text>
      </Pressable>
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
        <Pressable onPress={onPressNote}>
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>Note: {note ?? "-"}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default TransactionRow;
