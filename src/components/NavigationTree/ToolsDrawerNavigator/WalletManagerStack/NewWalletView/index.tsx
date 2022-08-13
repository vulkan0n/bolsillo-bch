import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons/faWallet";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import {
  addWallet,
  updateNewWalletScratchPadDescription,
  updateNewWalletScratchPadName,
} from "../../../../../redux/reducers/walletManagerReducer";
import TextInput from "../../../../atoms/TextInput";

function NewWalletView({ navigation }) {
  const dispatch = useDispatch();
  const { name, description, mnemonic, derivationPath } = useSelector(
    (state: ReduxState) => state.walletManager.scratchPad
  );
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  useEffect(() => {
    if (!mnemonic || !derivationPath) {
      console.log("its happening");
    }
  }, []);

  const validateName = () => {
    if (name.length === 0) {
      return "Can't be empty.";
    }

    if (name.length > 30) {
      return "Can't be more than 30 characters.";
    }

    return null;
  };

  const validateDescription = () => {
    if (description.length > 100) {
      return "Can't be more than 100 characters.";
    }

    return null;
  };

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  const onChangeName = (name: string) => {
    dispatch(
      updateNewWalletScratchPadName({
        name,
      })
    );
  };

  const onChangeDescription = (description: string) => {
    dispatch(
      updateNewWalletScratchPadDescription({
        description,
      })
    );
  };

  const onPressCreate = () => {
    dispatch(addWallet());
    navigation.navigate("Wallets");
  };

  const nameValidationError = validateName();
  const descriptionValidationError = validateDescription();

  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.h2 as any}>Name</Text>
      <TextInput isSmallText text={name} onChange={onChangeName} />
      {nameValidationError && (
        <Text style={TYPOGRAPHY.pRed as any}>{nameValidationError}</Text>
      )}
      <Text style={TYPOGRAPHY.h2 as any}>Description</Text>
      <TextInput
        isSmallText
        text={description}
        onChange={onChangeDescription}
      />
      {descriptionValidationError && (
        <Text style={TYPOGRAPHY.pRed as any}>{descriptionValidationError}</Text>
      )}
      <Text style={TYPOGRAPHY.h2 as any}>Mnemonic</Text>
      {!isMnemonicVisible && (
        <Button variant="blackOutlined" onPress={toggleIsMnemonicVisible}>
          Reveal mnemonic
        </Button>
      )}
      {isMnemonicVisible && (
        <Pressable
          onPress={toggleIsMnemonicVisible}
          style={styles.mnemonicContainer}
        >
          <Text style={TYPOGRAPHY.pWhite as any}>{mnemonic}</Text>
        </Pressable>
      )}
      <Text style={TYPOGRAPHY.h2 as any}>Derivation path</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>{derivationPath}</Text>
      <Button onPress={onPressCreate} icon={"faPlusCircle"}>
        Create wallet
      </Button>
    </View>
  );
}

export default NewWalletView;
