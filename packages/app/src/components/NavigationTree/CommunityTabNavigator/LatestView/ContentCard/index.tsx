import React, { useState } from "react";
import { View, Text } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import YoutubePlayer from "react-native-youtube-iframe";
import moment from "moment";
import TipWidget from "@selene-wallet/app/src/components/atoms/TipWidget";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";
import styles from "./styles";

interface Props {
  title: string;
  creator: string;
  publicationDate: Date;
  videoId: string;
  description: string;
  donationBchAddress?: string;
  isInteractive?: boolean;
}

function ContentCard({
  title = "",
  creator = "",
  publicationDate = new Date(),
  videoId = "",
  description = "",
  donationBchAddress,
  isInteractive = true,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onReady = () => {
    setIsLoaded(true);
  };

  return (
    <View
      style={styles.contentContainer}
      pointerEvents={isInteractive ? "auto" : "none"}
    >
      <View style={styles.textWrapper}>
        <Text style={TYPOGRAPHY.h2black as any}>{title}</Text>
        <Text style={TYPOGRAPHY.p as any}>{creator}</Text>
        <Text style={TYPOGRAPHY.p as any}>
          {moment(publicationDate).format("ll")}
        </Text>
      </View>
      <YoutubePlayer
        height={isLoaded ? 240 : 0}
        videoId={videoId}
        onReady={onReady}
        initialPlayerParams={{
          controls: false,
        }}
      />
      {!isLoaded && <Loading style={styles.loading} color={COLOURS.white} />}
      <Text style={TYPOGRAPHY.p as any}>{description}</Text>
      {!!donationBchAddress && (
        <TipWidget donationBchAddress={donationBchAddress} />
      )}
    </View>
  );
}

export default ContentCard;
