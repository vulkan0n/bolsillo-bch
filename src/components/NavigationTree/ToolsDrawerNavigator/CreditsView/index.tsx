import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

function CreditsView() {
  return (
    <View style={styles.container as any}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1 as any}>Selene Wallet</Text>
      <Text style={TYPOGRAPHY.h2 as any}>
        Made with love for the BCH community by Kallisti & Jeremy (from The
        Bitcoin Cash Podcast).
      </Text>
      <View style={TYPOGRAPHY.spacer as any}></View>
      <Text style={TYPOGRAPHY.h2 as any}>Open source code:</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        https://gitlab.com/selene.cash/selene-wallet
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>PRs always welcome!</Text>
      <View style={TYPOGRAPHY.spacer as any}></View>
      <Text style={TYPOGRAPHY.pWhite as any}>v0.0.2</Text>
    </View>
  );
}

export default CreditsView;
