import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, ScrollView, Text } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import YoutubePlayer from "react-native-youtube-iframe";
import moment from "moment";

interface Props {
  title: string;
  creator: string;
  publicationDate: Date;
  videoId: string;
  description: string;
}

function ContentCard({
  title = "",
  creator = "",
  publicationDate = new Date(),
  videoId = "",
  description = "",
}) {
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
      <Text style={TYPOGRAPHY.h2black as any}>{title}</Text>
      <Text style={TYPOGRAPHY.p as any}>{creator}</Text>
      <Text style={TYPOGRAPHY.p as any}>
        {moment(publicationDate).format("ll")}
      </Text>
      <YoutubePlayer height={240} videoId={videoId} onReady={onReady} />
      <Text style={TYPOGRAPHY.p as any}>{description}</Text>
    </View>
  );
}

export default ContentCard;
