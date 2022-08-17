import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import {
  createWalletFromScratchPad,
  clearWalletScratchPad,
  updateNewWalletScratchPadName,
  updateNewWalletScratchPadDescription,
  updateImportWalletScratchPadMnemonic,
  updateImportWalletScratchPadDerivationPath,
} from "../../../../../redux/reducers/walletManagerReducer";
import TextInput from "../../../../atoms/TextInput";
import emit from "../../../../../utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import Toast from "react-native-toast-message";
import {
  validateWalletName,
  validateWalletDescription,
  validateWalletMnemonic,
} from "../../../../../utils/validation";
import { DEFAULT_DERIVATION_PATH } from "../../../../../utils/consts";

function ImportWalletView({ navigation }) {
  const dispatch = useDispatch();
  const { name, description, mnemonic, derivationPath } = useSelector(
    (state: ReduxState) => state.walletManager.scratchPad
  );
  const existingWalletNames = useSelector((state: ReduxState) =>
    state.walletManager.wallets?.map?.(({ name }) => name)
  );
  const [isStartedEditingName, setIsStartedEditingName] = useState(false);
  const [isStartedEditingMnemonic, setIsStartedEditingMnemonic] =
    useState(false);

  useEffect(() => {
    dispatch(clearWalletScratchPad());
    dispatch(
      updateImportWalletScratchPadDerivationPath({
        derivationPath: DEFAULT_DERIVATION_PATH,
      })
    );
  }, []);

  const onChangeName = (newName: string) => {
    setIsStartedEditingName(true);
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
    setIsStartedEditingMnemonic(true);
    dispatch(
      updateImportWalletScratchPadMnemonic({
        mnemonic: newMnemonic.toLowerCase(),
      })
    );
  };

  const onPressCreate = () => {
    setIsStartedEditingName(false);
    setIsStartedEditingMnemonic(false);

    dispatch(createWalletFromScratchPad());
    navigation.navigate("Manage");

    Toast.show({
      type: "customSuccess",
      props: {
        title: "New wallet created",
        text: "Ready for transactions.",
      },
    });
  };

  const nameValidationError = validateWalletName(name, existingWalletNames);
  const descriptionValidationError = validateWalletDescription(description);
  const mnemonicValidationError = validateWalletMnemonic(mnemonic);
  const isImportDisabled =
    !!nameValidationError ||
    !!descriptionValidationError ||
    !!mnemonicValidationError;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h2 as any}>Name</Text>
        <TextInput isSmallText text={name} onChange={onChangeName} />
        {isStartedEditingName && nameValidationError && (
          <Text style={TYPOGRAPHY.pRed as any}>{nameValidationError}</Text>
        )}
        <Text style={TYPOGRAPHY.h2 as any}>Description</Text>
        <TextInput
          isSmallText
          text={description}
          onChange={onChangeDescription}
        />
        {descriptionValidationError && (
          <Text style={TYPOGRAPHY.pRed as any}>
            {descriptionValidationError}
          </Text>
        )}
        <Text style={TYPOGRAPHY.h2 as any}>Mnemonic</Text>
        <TextInput isSmallText text={mnemonic} onChange={onChangeMnemonic} />
        {isStartedEditingMnemonic && mnemonicValidationError && (
          <Text style={TYPOGRAPHY.pRed as any}>{mnemonicValidationError}</Text>
        )}
        <Text style={TYPOGRAPHY.h2 as any}>Derivation path</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>{DEFAULT_DERIVATION_PATH}</Text>
        <Button
          isDisabled={isImportDisabled}
          onPress={onPressCreate}
          icon={"faFileImport"}
        >
          Import wallet
        </Button>
      </View>
    </ScrollView>
  );
}

export default ImportWalletView;
