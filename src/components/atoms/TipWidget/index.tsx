import React, { useState } from "react";
import { View } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import Button from "@atoms/Button";
import emit from "@utils/emit";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import { ReduxState } from "@types";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveWallet } from "@redux/selectors";
import { updateTransactionPadIsSendingCoins } from "@redux/reducers/transactionPadReducer";
import { selectActiveWalletBalance } from "@redux/selectors";

interface Props {
  donationBchAddress: string;
}

function TipWidget({ donationBchAddress }: Props) {
  const [tipAmountInIntSats, setTipAmountInIntSats] = useState(100000);
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const dispatch = useDispatch();
  const { isSendingCoins } = useSelector(
    (state: ReduxState) => state.transactionPad
  );
  const { availableRawSats } = useSelector((state: ReduxState) =>
    selectActiveWalletBalance(state)
  );

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
        height: 65,
        minHeight: 65,
      }}
    >
      <View
        style={{
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          width: 300,
          height: 65,
          minHeight: 65,
        }}
      >
        <Button
          onPress={onPressTipBch}
          variant="primary"
          icon={"faBitcoinSign"}
          isLoading={isSendingCoins}
          isDisabled={tipAmountInIntSats > parseInt(availableRawSats)}
        >
          Tip {`${tipAmountInIntSats}`} sats
        </Button>
      </View>
    </View>
  );
}

export default TipWidget;
