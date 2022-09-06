import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, ScrollView, Text } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import YoutubePlayer from "react-native-youtube-iframe";
import Button from "@atoms/Button";
import SHADOW from "../../../../design/shadow";

function LearnView({ navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onReady = () => {
    setIsLoaded(true);
  };

  if (!isLoaded) {
    <ActivityIndicator
      style={{ height: 50 }}
      size="large"
      color={COLOURS.black}
    />;
  }

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1black as any}>
          Welcome to the BCH community!
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          There is a lot to learn, but we promise it's not as scary as it seems!
        </Text>
        <View
          style={{
            paddingTop: SPACING.five,
            marginVertical: SPACING.five,
            backgroundColor: COLOURS.veryLightGrey,
            borderColor: COLOURS.lightGrey,
            borderWidth: 2,
            borderRadius: SPACING.borderRadius,
          }}
        >
          <Text style={TYPOGRAPHY.h2black as any}>Who Killed Bitcoin?</Text>
          <Text style={TYPOGRAPHY.p as any}>La Eterna Vigilante</Text>
          <YoutubePlayer
            height={240}
            videoId={"eafzIW52Rgc"}
            onReady={onReady}
          />
          <Text style={TYPOGRAPHY.p as any}>
            A 45 minute documentary explaining money, power and the history of
            Bitcoin.
          </Text>
        </View>
        <YoutubePlayer height={300} videoId={"qxsRnsDzz4A"} onReady={onReady} />
      </View>
    </ScrollView>
  );
}

export default LearnView;
