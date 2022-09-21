import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, ScrollView, Text } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import YoutubePlayer from "react-native-youtube-iframe";
import moment from "moment";
import Button from "../../../../atoms/Button";

interface Props {
  title: string;
  creator: string;
  publicationDate: Date;
  videoId: string;
  description: string;
  donationBchAddress?: string;
}

function ContentCard({
  title = "",
  creator = "",
  publicationDate = new Date(),
  videoId = "",
  description = "",
  donationBchAddress,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onReady = () => {
    setIsLoaded(true);
  };

  const onPressTipBch = () => {
    console.log("tipping", donationBchAddress);
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
      <View
        style={{
          marginHorizontal: SPACING.ten,
        }}
      >
        <Text style={TYPOGRAPHY.h2black as any}>{title}</Text>
        <Text style={TYPOGRAPHY.p as any}>{creator}</Text>
        <Text style={TYPOGRAPHY.p as any}>
          {moment(publicationDate).format("ll")}
        </Text>
      </View>
      <YoutubePlayer height={240} videoId={videoId} onReady={onReady} />
      <Text style={TYPOGRAPHY.p as any}>{description}</Text>
      {!!donationBchAddress && (
        <View
          style={{
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            width: 300,
          }}
        >
          <Button
            onPress={onPressTipBch}
            variant="primary"
            icon={"faBitcoinSign"}
          >
            Tip BCH
          </Button>
          <Text style={{ textAlign: "center" }}>{donationBchAddress}</Text>
        </View>
      )}
    </View>
  );
}

export default ContentCard;
