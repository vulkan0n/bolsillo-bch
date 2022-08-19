import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { ReduxState } from "../../../../../types";
import {
  createWalletFromScratchPad,
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
import { ScrollView } from "react-native-gesture-handler";
import StackSubheader from "../../../../atoms/StackSubheader";

function NewWalletView({ navigation }) {
  const dispatch = useDispatch();
  const { name, description, mnemonic, derivationPath } = useSelector(
    (state: ReduxState) => state.walletManager.scratchPad
  );
  const existingWalletNames = useSelector((state: ReduxState) =>
    state.walletManager.wallets?.map?.(({ name }) => name)
  );
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);
  const [isStartedEditing, setIsStartedEditing] = useState(false);

  useEffect(() => {
    if (!mnemonic || !derivationPath) {
      emit({
        type: BRIDGE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET,
        data: {},
      });
    }
  }, []);

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

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

  const onPressCreate = () => {
    setIsStartedEditing(false);
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
  const isCreateDisabled =
    !!nameValidationError || !!descriptionValidationError;

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"New"} isBackButton />
      <ScrollView style={styles.scrollView}>
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
            <Text style={TYPOGRAPHY.pRed as any}>
              {descriptionValidationError}
            </Text>
          )}
          <Text style={TYPOGRAPHY.h2 as any}>Mnemonic</Text>
          {!isMnemonicVisible && (
            <Button
              icon={"faEye"}
              variant="blackOutlined"
              onPress={toggleIsMnemonicVisible}
            >
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
          <Button
            isDisabled={isCreateDisabled}
            onPress={onPressCreate}
            icon={"faPlusCircle"}
          >
            Create wallet
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

export default NewWalletView;
