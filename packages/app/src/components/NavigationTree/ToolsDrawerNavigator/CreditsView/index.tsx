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
import WebLink from "@selene-wallet/app/src/components/atoms/WebLink";
import { DEVELOPER_DONATION_ADDRESS } from "@selene-wallet/common/dist/utils/consts";

function CreditsView() {
  const version = "v0.1.0";
  const gitlabUrl = "https://gitlab.com/selene.cash/selene-wallet";

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
        <View style={TYPOGRAPHY.spacer as any}></View>
        <Text style={TYPOGRAPHY.h2 as any}>Source code:</Text>
        <WebLink url={gitlabUrl} isWhite />
        <Text style={TYPOGRAPHY.pWhite as any}>PRs always welcome!</Text>
        <View style={TYPOGRAPHY.spacer as any}></View>
        <Text style={TYPOGRAPHY.pWhite as any}>{version}</Text>

        <View style={TYPOGRAPHY.spacer as any}></View>
        <Text style={TYPOGRAPHY.h2 as any}>Code Contributors:</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Kallisti</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Pat (Mainnet.cash)</Text>
        <View style={TYPOGRAPHY.spacer as any}></View>

        <Text style={TYPOGRAPHY.h2 as any}>Thanks to:</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>2_qx (Mainnet.cash)</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>Jason Dreyzehner (Libauth)</Text>
        <View style={TYPOGRAPHY.spacer as any}></View>

        <Text style={TYPOGRAPHY.h2 as any}>Testers:</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          Bitcoin Jason, fshinetop, Jett Scythe
        </Text>
      </View>
    </ScrollView>
  );
}

export default CreditsView;
