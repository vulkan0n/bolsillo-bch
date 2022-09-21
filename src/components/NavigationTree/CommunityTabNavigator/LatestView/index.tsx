import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, ScrollView, Text } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import YoutubePlayer from "react-native-youtube-iframe";
import Button from "@atoms/Button";
import SHADOW from "../../../../design/shadow";
import ContentCard from "./ContentCard";

const CONTENT = [
  {
    key: 1,
    title: "Who Killed Bitcoin?",
    creator: "La Eterna Vigilante",
    publicationDate: new Date(2022, 0, 11),
    videoId: "eafzIW52Rgc",
    description:
      "A 45 minute documentary explaining money, power and the history of Bitcoin.",
  },
];

function LatestView({ navigation }) {
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
        <Text
          style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.fifteen } as any}
        >
          Welcome to Bitcoin Cash!
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Get up to speed with the latest from the BCH community.
        </Text>
        {CONTENT.map(
          ({ key, title, creator, publicationDate, videoId, description }) => (
            <ContentCard
              key={key}
              title={title}
              creator={creator}
              publicationDate={publicationDate}
              videoId={videoId}
              description={description}
            />
          )
        )}
      </View>
    </ScrollView>
  );
}

export default LatestView;
