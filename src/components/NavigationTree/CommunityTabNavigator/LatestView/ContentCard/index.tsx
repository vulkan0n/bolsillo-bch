import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, ScrollView, Text } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import YoutubePlayer from "react-native-youtube-iframe";
import moment from "moment";
import Button from "@atoms/Button";
import emit from "@utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ReduxState } from "@types";
import { useSelector } from "react-redux";
import { selectActiveWallet } from "@redux/selectors";

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
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const onReady = () => {
    setIsLoaded(true);
  };

  const onPressTipBch = () => {
    if (!donationBchAddress) {
      return;
    }

    emit({
      type: BRIDGE_MESSAGE_TYPES.SEND_COINS,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        recipientCashAddr: donationBchAddress,
        satsToSend: 100000,
        isTestNet,
      },
    });
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
            Tip 100 000 sats
          </Button>
        </View>
      )}
    </View>
  );
}

export default ContentCard;
