import React, { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { displaySats, displayUsd } from "../../../../../utils/formatting";
import Divider from "../../../../atoms/Divider";
import SPACING from "../../../../../design/spacing";

function ManageWalletsView({ navigation }) {
  const { activeWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  console.log({ activeWalletName, wallets });

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  // TODO: Clean up once Reset is linked somewhere else
  // const onPressResetWallet = () => {
  //   navigation.navigate("Reset");
  // };

  const onPressNew = () => {
    // TODO: Finish this method
    //   navigation.navigate("Reset");
  };

  const renderWallets = ({ item: { name, description, balance } }) => {
    const isActive = activeWalletName === name;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ width: 30 }}>
          <FontAwesomeIcon
            icon={faWallet}
            size={isActive ? 30 : 20}
            color={isActive ? COLOURS.bchGreen : COLOURS.white}
          />
        </View>
        <View
          style={{
            flex: 1,
            paddingLeft: SPACING.ten,
            paddingRight: SPACING.ten,
          }}
        >
          <Text style={TYPOGRAPHY.h2Left as any}>{name}</Text>
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>{description}</Text>
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            {displaySats(balance)}
          </Text>
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            {displayUsd(balance)}
          </Text>
        </View>
        <View style={{ width: 100 }}>
          {!isActive && (
            <Pressable>
              <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Activate</Text>
            </Pressable>
          )}
          <Pressable>
            <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Backup</Text>
          </Pressable>
          {!isActive && (
            <Pressable>
              <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const WalletActions = (
    <View>
      <Divider />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <Button
          onPress={onPressNew}
          variant={"blackOutlined"}
          isSmall
          icon={"faPlusCircle"}
        >
          New
        </Button>
        <Button variant={"blackOutlined"} isSmall icon={"faFileImport"}>
          Import
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container as any}>
      <FlatList
        style={
          {
            flex: 1,
            color: "white",
            width: "100%",
          } as any
        }
        ItemSeparatorComponent={() => <Divider />}
        data={wallets}
        renderItem={renderWallets}
        keyExtractor={({ name }) => name}
        ListFooterComponent={WalletActions}
      />
    </View>
  );
}

export default ManageWalletsView;
