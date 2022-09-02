import {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
} from "@redux/reducers/transactionPadReducer";
import { convertRawSatsToRawCurrencyRounded } from "@utils/formatting";
import { validateRequestString } from "@utils/validation";

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
    }

    dispatch(
      updateTransactionPadView({
        view: "Confirm",
      })
    );
  }

  return { isValid, address, rawSatAmount };
};
