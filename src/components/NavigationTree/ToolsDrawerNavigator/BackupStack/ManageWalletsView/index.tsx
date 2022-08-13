import React, { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { displaySats, displayUsd } from "../../../../../utils/formatting";
import Divider from "../../../../atoms/Divider";

function ManageWalletsView({ navigation }) {
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  console.log({ wallet });

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  const onPressResetWallet = () => {
    navigation.navigate("Reset");
  };

  const wallets = [
    {
      name: "My wallet",
      description: "Use for good stuff",
      mnemonic: "asdfasdfas",
      balance: "1234",
      isActive: true,
    },
    {
      name: "My wallet 2",
      description: "Use for dodgy stuff",
      mnemonic: "another mnemonic",
      balance: "1234567",
      isActive: false,
    },
    {
      name: "My wallet 3",
      description: "Use for dodgy stuff",
      mnemonic: "another mnemonic xxxxx",
      balance: "1234567",
      isActive: false,
    },
  ];

  const activeWallet = wallets?.find(({ isActive }) => isActive);
  const inactiveWallets = wallets?.filter(
    ({ name }) => name !== activeWallet?.name
  );

  const renderInactiveWallet = ({
    item: { name, description, mnemonic, balance, isActive },
  }) => (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={TYPOGRAPHY.h2Left as any}>{name}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{description}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{displaySats(balance)}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{displayUsd(balance)}</Text>
      </View>
      <View style={{ width: 100 }}>
        <Pressable>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Activate</Text>
        </Pressable>
        <Pressable>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Backup</Text>
        </Pressable>
        <Pressable>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container as any}>
      <View style={styles.iconContainer}>
        <FontAwesomeIcon icon={faWallet} size={50} color={COLOURS.bchGreen} />
      </View>
      <FlatList
        style={
          {
            flex: 1,
            color: "white",
            width: "100%",
          } as any
        }
        ItemSeparatorComponent={() => <Divider />}
        data={inactiveWallets}
        renderItem={renderInactiveWallet}
        keyExtractor={({ name }) => name}
      />
    </View>
  );
}

export default ManageWalletsView;
