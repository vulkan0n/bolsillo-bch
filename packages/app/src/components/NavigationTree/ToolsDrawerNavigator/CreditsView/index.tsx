import React from "react";
import {
  Pressable,
  View,
  Image,
  Text,
  Linking,
  ScrollView,
} from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import TipWidget from "@selene-wallet/app/src/components/atoms/TipWidget";
import { DEVELOPER_DONATION_ADDRESS } from "@selene-wallet/common/dist/utils/consts";

function CreditsView() {
  const version = "v0.0.12";
  const gitlabUrl = "https://gitlab.com/selene.cash/selene-wallet";

  const onPressUrl = () => {
    Linking.openURL(gitlabUrl);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container as any}>
        <Image
          style={styles.logo}
          source={require("../../../../assets/images/logo.jpg")}
        />
        <Text style={TYPOGRAPHY.h1 as any}>Selene Wallet</Text>
        <Text style={TYPOGRAPHY.h2 as any}>
          Made with love for the BCH community by Jeremy from The Bitcoin Cash
          Podcast.
        </Text>
        <TipWidget
          donationBchAddress={DEVELOPER_DONATION_ADDRESS}
          isWhiteText
        />
        <Text style={TYPOGRAPHY.pWhite as any}>Thanks to:</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Kallisti (inspiration)</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>2_qx (Mainnet.cash)</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Jason Dreyzehner (Libauth)</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Testers:</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          Bitcoin Jason, fshinetop, Jett Scythe
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
    </ScrollView>
  );
}

export default CreditsView;
