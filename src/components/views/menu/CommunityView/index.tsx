import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

const CommunityView = () => {
  return (
    <View style={styles.container as any}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1 as any}>BCH Community</Text>
      <View style={styles.background as any}>
        <Text style={TYPOGRAPHY.h2black as any}>Twitter</Text>
        <Text style={TYPOGRAPHY.p as any}>#BitcoinCash</Text>
        <Divider />
        <Text style={TYPOGRAPHY.h2black as any}>Twitter</Text>
        <Text style={TYPOGRAPHY.p as any}>#BitcoinCash</Text>
        <Text>Top follows:</Text>
        <Text>@TheBCHPodcast</Text>
        <Text>@BeCashy</Text>
        <Text>@TheBCHPodcast</Text>
        <Text>@TheBCHPodcast</Text>
        <Text>@RogerVer</Text>
        <Text>@TheBCHPodcast</Text>
        <Text>... Explore more</Text>
      </View>
    </View>
  );
};

export default CommunityView;
