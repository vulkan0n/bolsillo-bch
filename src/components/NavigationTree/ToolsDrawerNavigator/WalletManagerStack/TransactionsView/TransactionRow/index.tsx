import React from "react";
import { Pressable, View, Text, Linking } from "react-native";
import TYPOGRAPHY from "@design/typography";
import TextInput from "@atoms/TextInput";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";

const TransactionRow = ({ transaction, editNoteHash, setEditNoteHash }) => {
  const { height, tx_hash, note } = transaction;
  const dispatch = useDispatch();

  const blockchairUrl = `https://blockchair.com/bitcoin-cash/transaction/${tx_hash}`;

  const onPressTransactionHash = async () => {
    Linking.openURL(blockchairUrl);
  };

  const onPressNote = () => setEditNoteHash(tx_hash);

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

  https: return (
    <View>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>
        Height: {height >= 1 ? height : "Unconfirmed"}
      </Text>
      <Pressable onPress={onPressTransactionHash}>
        <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Hash: {tx_hash}</Text>
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
