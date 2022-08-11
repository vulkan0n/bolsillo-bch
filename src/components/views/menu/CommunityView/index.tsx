import React from "react";
import { View, Image, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import Divider from "../../../atoms/Divider";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons/faHashtag";
import { faMessage } from "@fortawesome/free-solid-svg-icons/faMessage";
import COLOURS from "../../../../design/colours";

const CommunityView = () => {
  return (
    <View style={styles.container as any}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1 as any}>BCH Community</Text>
      <View style={styles.background as any}>
        <Text style={TYPOGRAPHY.h2black as any}>Reddit</Text>
        {/* TODO: Get better icon */}
        <FontAwesomeIcon
          style={styles.icon}
          icon={faMessage}
          size={45}
          color={COLOURS.bchGreen}
        />

        <Text style={TYPOGRAPHY.p as any}>/r/btc</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Home of big-block Bitcoin discussion since before the BTC/BCH split.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>/r/Bitcoincash</Text>
        <Text style={TYPOGRAPHY.p as any}>
          /r/btc minus the historical context
        </Text>

        <Divider />
        {/* TODO: Get better icon */}
        <Text style={TYPOGRAPHY.h2black as any}>Twitter</Text>
        <FontAwesomeIcon
          style={styles.icon}
          icon={faHashtag}
          size={45}
          color={COLOURS.bchGreen}
        />
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
