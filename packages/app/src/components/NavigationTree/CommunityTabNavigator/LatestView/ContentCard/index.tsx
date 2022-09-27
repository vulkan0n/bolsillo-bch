import React, { useState } from "react";
import { View, Text } from "react-native";
import { COLOURS } from "@selene/common";
import { SPACING } from "@selene/common";
import TYPOGRAPHY from "@design/typography";
import YoutubePlayer from "react-native-youtube-iframe";
import moment from "moment";
import TipWidget from "@atoms/TipWidget";
import emit from "@utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ReduxState } from "@types";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@redux/reducers/transactionPadReducer";
import { selectActiveWalletBalance } from "@redux/selectors";
import { BallIndicator } from "react-native-indicators";

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
  const [tipAmountInIntSats, setTipAmountInIntSats] = useState(100000);
  const [isLoaded, setIsLoaded] = useState(false);
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const dispatch = useDispatch();
  const { isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { availableRawSats } = useSelector((state: ReduxState) =>
    selectActiveWalletBalance(state)
  );

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
        satsToSend: tipAmountInIntSats,
        isTestNet,
      },
    });

    dispatch(
      updateTransactionPadIsSendingCoins({
        isSendingCoins: true,
      })
    );
  };

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
      <YoutubePlayer
        height={isLoaded ? 240 : 0}
        videoId={videoId}
        onReady={onReady}
      />
      {!isLoaded && (
        <BallIndicator
          size={30}
          style={{
            height: 225,
            backgroundColor: COLOURS.black,
            marginBottom: 15,
          }}
          color={COLOURS.white}
        />
      )}
      <Text style={TYPOGRAPHY.p as any}>{description}</Text>
      {!!donationBchAddress && (
        <TipWidget donationBchAddress={donationBchAddress} />
      )}
    </View>
  );
}

export default ContentCard;
