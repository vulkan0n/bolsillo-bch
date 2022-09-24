import React from "react";
import { Pressable, View, Text, Linking } from "react-native";
import TYPOGRAPHY from "@design/typography";
import TextInput from "@atoms/TextInput";
import Button from "@atoms/Button";
import { useDispatch } from "react-redux";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";
import COLOURS from "@design/colours";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "../../../../../../design/icons";

const TransactionRow = ({ transaction, editNoteHash, setEditNoteHash }) => {
  const { blockheight, txn, note, balance, fee, from, to, value } = transaction;
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
  const isReceive = value > 0;

  return (
    <View>
      <FontAwesomeIcon
        icon={iconImport(isReceive ? "faBitcoinSign" : "faPaperPlane")}
        size={20}
        color={COLOURS.white}
      />
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>
        {isReceive ? "Received" : "Sent"}
      </Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>Value {value}</Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>Balance {balance}</Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>
        Height: {blockheight >= 1 ? blockheight : "Unconfirmed"}
      </Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>From: {from}</Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>To: {to}</Text>
      <Text style={TYPOGRAPHY.pWhiteLeft as any}>Fee: {fee} satoshis</Text>
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
