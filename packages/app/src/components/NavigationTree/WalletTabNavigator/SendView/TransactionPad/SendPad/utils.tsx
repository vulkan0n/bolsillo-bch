import {
  updateTransactionPadView,
  updateTransactionPadBalance,
  updateTransactionPadSendToAddress,
} from "@selene-wallet/app/src/redux/reducers/transactionPadReducer";
import { convertRawSatsToRawCurrencyRounded } from "@selene-wallet/app/src/utils/formatting";
import { validateRequestString } from "@selene-wallet/app/src/utils/validation";
import { ValidateRequestType, AppDispatch } from "@selene-wallet/app/src/types";
import { CurrencyOrDenominationType } from "@selene-wallet/common/dist/types";

export const processRequestString = ({
  dispatch,
  primaryCurrency,
  requestString = "",
  isTestNet = false,
}: {
  dispatch: AppDispatch;
  primaryCurrency: CurrencyOrDenominationType;
  requestString: string;
  isTestNet: boolean;
}): ValidateRequestType => {
  const { isValid, address, rawSatAmount }: ValidateRequestType =
    validateRequestString(requestString, isTestNet);

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
