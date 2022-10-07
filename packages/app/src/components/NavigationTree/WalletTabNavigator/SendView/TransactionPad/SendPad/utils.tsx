import {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
} from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { convertRawSatsToRawCurrencyRounded } from "@selene-wallet/app/src/utils/formatting";
import { validateRequestString } from "@selene-wallet/app/src/utils/validation";

export const processRequestString = ({
  dispatch,
  primaryCurrency,
  requestString = "",
  isTestNet = false,
}) => {
  const { isValid, address, rawSatAmount } = validateRequestString(
    requestString,
    isTestNet
  );

  if (isValid) {
    if (address) {
      dispatch(
        updateTransactionPadSendToAddress({
          sendToAddress: address,
        })
      );
    }

    if (rawSatAmount) {
      dispatch(
        updateTransactionPadBalance({
          padBalance: convertRawSatsToRawCurrencyRounded(
            rawSatAmount,
            primaryCurrency
          ),
        })
      );
      dispatch(
        updateTransactionPadView({
          view: "Confirm",
        })
      );
      return;
    }

    dispatch(
      updateTransactionPadView({
        view: "NumPad",
      })
    );
  }

  return { isValid, address, rawSatAmount };
};
