import React from "react";
import { Pressable, View, Image, Text, Linking } from "react-native";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";

function CreditsView() {
  const version = "v0.0.8";
  const gitlabUrl = "https://gitlab.com/selene.cash/selene-wallet";

  const onPressUrl = () => {
    Linking.openURL(gitlabUrl);
  };

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
      <Text style={TYPOGRAPHY.h2 as any}>Source code:</Text>
      <Pressable onPress={onPressUrl}>
        <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>{gitlabUrl}</Text>
      </Pressable>
      <Text style={TYPOGRAPHY.pWhite as any}>PRs always welcome!</Text>
      <View style={TYPOGRAPHY.spacer as any}></View>
      <Text style={TYPOGRAPHY.pWhite as any}>{version}</Text>
    </View>
  );
}

export default CreditsView;
