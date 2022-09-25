import React from "react";
import { Pressable, View, Text, Linking } from "react-native";
import TYPOGRAPHY from "@design/typography";
import TextInput from "@atoms/TextInput";
import Button from "@atoms/Button";
import { useDispatch, useSelector } from "react-redux";
import { updateTransactionNote } from "@redux/reducers/walletManagerReducer";
import COLOURS from "@design/colours";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@design/icons";
import { convertBalanceToDisplay } from "../../../../../../utils/formatting";
import { BITCOIN_DENOMINATIONS } from "../../../../../../utils/consts";
import { ReduxState } from "../../../../../../types";
import {
  selectPrimaryCurrencyOrDenomination,
  selectSecondaryCurrencyOrDenomination,
} from "../../../../../../redux/selectors";
import SPACING from "../../../../../../design/spacing";

const TransactionRow = ({ transaction, editNoteHash, setEditNoteHash }) => {
  const { blockheight, txn, note, balance, fee, from, to, value } = transaction;
  const dispatch = useDispatch();
  const primaryCurrency = useSelector((state: ReduxState) =>
    selectPrimaryCurrencyOrDenomination(state)
  );
  const secondaryCurrency = useSelector((state: ReduxState) =>
    selectSecondaryCurrencyOrDenomination(state)
  );
  const absoluteValue = Math.abs(value).toString();
  const primaryValue = convertBalanceToDisplay(
    absoluteValue,
    BITCOIN_DENOMINATIONS.satoshis,
    primaryCurrency
  );
  const secondaryValue = convertBalanceToDisplay(
    absoluteValue,
    BITCOIN_DENOMINATIONS.satoshis,
    secondaryCurrency
  );
  const primaryBalance = convertBalanceToDisplay(
    balance,
    BITCOIN_DENOMINATIONS.satoshis,
    primaryCurrency
  );
  const secondaryBalance = convertBalanceToDisplay(
    balance,
    BITCOIN_DENOMINATIONS.satoshis,
    secondaryCurrency
  );

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
      <View
        style={{
          flexDirection: "row",
          paddingBottom: SPACING.five,
        }}
      >
        <View
          style={{
            marginTop: SPACING.five,
            width: 50,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon
            icon={iconImport(isReceive ? "faBitcoinSign" : "faPaperPlane")}
            size={25}
            color={COLOURS.black}
          />
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Text style={TYPOGRAPHY.h2black as any}>
            {isReceive ? "Received" : "Sent"}
          </Text>
          <Text style={TYPOGRAPHY.pLeft as any}>
            {`Block: ${blockheight ? `#${blockheight}` : "Unconfirmed"}`}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "flex-end",
            marginRight: SPACING.ten,
          }}
        >
          <Text style={TYPOGRAPHY.h2black as any}>
            {isReceive ? "+ " : "- "}
            {primaryValue}
          </Text>
          <Text style={TYPOGRAPHY.pLeft as any}>{primaryBalance}</Text>
          <Text style={TYPOGRAPHY.pLeft as any}>
            {isReceive ? "+ " : "- "}
            {secondaryValue}
          </Text>
          <Text style={TYPOGRAPHY.pLeft as any}>{secondaryBalance}</Text>
        </View>

        {/* <Text style={TYPOGRAPHY.pLeft as any}>From: {from}</Text>
      <Text style={TYPOGRAPHY.pLeft as any}>To: {to}</Text>
      <Text style={TYPOGRAPHY.pLeft as any}>Fee: {fee} satoshis</Text>
      <Pressable onPress={onPressTransactionHash}>
        <Text style={TYPOGRAPHY.pUnderlined as any}>Hash: {txn}</Text>
      </Pressable> */}
      </View>
      {isEditing && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={TYPOGRAPHY.pLeft as any}>Note:</Text>
          <TextInput text={note} isSmallText isMultiline onChange={onChange} />
          <Button icon={"faCircleCheck"} onPress={onFinishedEditing}>
            Ok
          </Button>
        </View>
      )}
      {!isEditing && (
        <Pressable onPress={onPressNote}>
          <Text style={TYPOGRAPHY.pLeft as any}>Note: {note ?? "-"}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default TransactionRow;
