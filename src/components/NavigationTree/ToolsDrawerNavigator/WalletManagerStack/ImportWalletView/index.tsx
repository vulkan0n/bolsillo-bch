import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import {
  addWallet,
  clearWalletScratchPad,
  updateNewWalletScratchPadDescription,
  updateNewWalletScratchPadName,
} from "../../../../../redux/reducers/walletManagerReducer";
import TextInput from "../../../../atoms/TextInput";
import emit from "../../../../../utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import Toast from "react-native-toast-message";
import {
  validateWalletName,
  validateWalletDescription,
} from "../../../../../utils/validation";

function ImportWalletView({ navigation }) {
  const dispatch = useDispatch();
  const { name, description, mnemonic, derivationPath } = useSelector(
    (state: ReduxState) => state.walletManager.scratchPad
  );
  const [isStartedEditing, setIsStartedEditing] = useState(false);

  useEffect(() => {
    console.log("clearing scratchpad");
    dispatch(clearWalletScratchPad());
  }, []);

  const onChangeName = (newName: string) => {
    setIsStartedEditing(true);
    dispatch(
      updateNewWalletScratchPadName({
        name: newName,
      })
    );
  };

  const onChangeDescription = (newDescription: string) => {
    dispatch(
      updateNewWalletScratchPadDescription({
        description: newDescription,
      })
    );
  };

  const onChangeMnemonic = (newMnemonic: string) => {
    dispatch(
      updateNewWalletScratchPadDescription({
        mnemonic: newMnemonic,
      })
    );
  };

  const onPressCreate = () => {
    setIsStartedEditing(false);
    dispatch(addWallet());
    navigation.navigate("Manage");
    Toast.show({
      type: "customSuccess",
      props: {
        title: "New wallet created",
        text: "Ready for transactions.",
      },
    });
  };

  const nameValidationError = validateWalletName(name);
  const descriptionValidationError = validateWalletDescription(description);

  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.h2 as any}>Name</Text>
      <TextInput isSmallText text={name} onChange={onChangeName} />
      {isStartedEditing && nameValidationError && (
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
      <TextInput isSmallText text={mnemonic} onChange={onChangeMnemonic} />
      <Text style={TYPOGRAPHY.h2 as any}>Derivation path</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>{derivationPath}</Text>
      <Button
        isDisabled={!!nameValidationError}
        onPress={onPressCreate}
        icon={"faFileImport"}
      >
        Import wallet
      </Button>
    </View>
  );
}

export default ImportWalletView;
