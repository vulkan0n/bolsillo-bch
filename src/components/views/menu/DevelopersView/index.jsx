import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

function DevelopersView() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1}>SELENE</Text>
      <Text style={TYPOGRAPHY.h2}>
        Made with love for the BCH community by Kallisti & Jeremy (from The
        Bitcoin Cash Podcast).
      </Text>
      <View style={TYPOGRAPHY.spacer}></View>
      <Text style={TYPOGRAPHY.h2}>Open source code:</Text>
      <Text style={TYPOGRAPHY.pWhite}>
        https://gitlab.com/selene.cash/selene-wallet
      </Text>
      <Text style={TYPOGRAPHY.pWhite}>PRs always welcome!</Text>
      <View style={TYPOGRAPHY.spacer}></View>
      <Text style={TYPOGRAPHY.h2}>Donations:</Text>
      <Text style={TYPOGRAPHY.h2}>-- TBC --</Text>
    </View>
  );
}

export default DevelopersView;
