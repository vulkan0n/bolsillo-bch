/* eslint-disable react/jsx-props-no-spreading */
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { TokenEntity } from "@/services/TokenManagerService";

import Button from "@/atoms/Button";
import NumberFormat from "@/atoms/NumberFormat";

import { satsToBch } from "@/util/sats";
import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

export default function ConfirmConvertAndSendPayoutOverlay({
  convertInfo,
  onConfirm,
  onCancel,
}: {
  convertInfo: {
    showQuoteChangedMessage: boolean;
    tokenEntity: TokenEntity;
    spend: {
      tokenAmount: bigint;
    };
    txfee: {
      bchAmount: bigint;
    };
    payouts: {
      change: {
        bchAmount: bigint;
      };
    };
  };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const txfeeText = `${satsToBch(convertInfo.txfee.bchAmount).bch} BCH`;
  const changeText = `${satsToBch(convertInfo.payouts.change.bchAmount).bch} BCH`;
  return (
    <div className="fixed top-0 w-full h-screen z-40 flex flex-col items-center justify-center bg-transparent">
      {convertInfo.showQuoteChangedMessage ? (
        <div className="mx-2 my-2">
          {translate(
            translations.confirm_convert_and_send_payout_quote_changed_message
          )}
        </div>
      ) : (
        false
      )}
      <div className="text-center">
        <div className="mx-2 my-2">
          {translate(
            translations.confirm_convert_and_send_payout_message_pre_token_amount
          )}
          <span
            className="relative bottom-[1px] pr-0.5"
            style={{ color: convertInfo.tokenEntity.color }}
          >
            &#9679;
          </span>
          <span className="">
            <NumberFormat
              number={convertInfo.spend.tokenAmount}
              scalar={-convertInfo.tokenEntity.token.decimals}
              decimals={convertInfo.tokenEntity.token.decimals}
            />
          </span>
          <span className="">{convertInfo.tokenEntity.token.symbol}</span>
          {translate(
            translations.confirm_convert_and_send_payout_message_post_token_amount
          )}
          <span>{txfeeText}</span>
          {translate(
            translations.confirm_convert_and_send_payout_message_post_txfee_amount
          )}
          <span>{changeText}</span>
          {translate(
            translations.confirm_convert_and_send_payout_message_post_change_amount
          )}
        </div>
      </div>
      <div className="flex flex-col justify-end shrink my-6">
        <div className="flex w-full justify-around items-center px-2 gap-x-2">
          <div className="mx-2">
            <Button
              icon={ArrowLeftOutlined}
              iconSize="lg"
              borderClasses="border border-2"
              label={translate(translations.back)}
              onClick={onCancel}
            />
          </div>
          <div className="grow" />
          <div className="mx-2">
            <Button
              icon={CheckOutlined}
              iconSize="lg"
              label={translate(translations.confirm)}
              onClick={onConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
