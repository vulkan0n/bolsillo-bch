import toast from "react-hot-toast";
import {
  SnippetsFilled,
  DisconnectOutlined,
  InsuranceOutlined,
} from "@ant-design/icons";

import translations from "@/views/wallet/translations";
import Satoshi from "@/atoms/Satoshi";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";

import { logos } from "@/util/logos";

import { translate } from "@/util/translations";

export default function NotificationService() {
  return {
    spawn,
    error,
    success,
    paymentReceived,
    tokenReceived,
    clipboardCopy,
    disconnected,
    authFail,
    invalidScan,
    expiredPayment,
  };

  function error(header, body?) {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header,
      body: body ? <span>{body}</span> : null,
    });
  }

  function success(header, body?) {
    spawn({
      icon: <InsuranceOutlined className="text-4xl text-primary" />,
      header,
      body: body ? <span>{body}</span> : null,
    });
  }

  function spawn({ header, body, icon, options = {} }) {
    toast.custom((t) => {
      // Toasts should theoretically be removed after 3 seconds
      // because of the duration option
      // but sometimes aren't, so this ensures they are cleaned up
      setTimeout(() => {
        toast.remove(t.id);
      }, 3000);

      return (
        <div
          className="relative opacity-95 w-full bg-white shadow-lg rounded-lg flex ring-1 ring-black ring-opacity-5 p-2"
          onClick={() => {
            toast.remove(t.id);
          }}
        >
          <div className="my-auto p-2">
            <div className="flex items-center justify-center">{icon}</div>
          </div>
          <div className="p-1 break-word">
            <div className="text-lg font-bold text-neutral-800">{header}</div>
            <div className="text-base text-neutral-600 flex">{body}</div>
          </div>
        </div>
      );
    }, options);
  }

  function paymentReceived(amount, token?) {
    spawn({
      icon: token ? (
        <TokenIcon category={token.category} size={64} />
      ) : (
        <img
          src={logos.selene.img}
          style={{ width: "64px", height: "64px" }}
          alt=""
        />
      ),
      header: translate(translations.paymentReceived),
      body: (
        <div className="flex flex-col">
          {token ? (
            <>
              <div>
                <TokenAmount token={token} />
              </div>
              <div className="text-primary-700 text-sm">
                +<Satoshi value={amount} fiat={false} />
              </div>
            </>
          ) : (
            <>
              <div className="text-primary-700">
                +<Satoshi value={amount} />
              </div>
              <div className="text-neutral-500 font-mono text-sm">
                <Satoshi value={amount} flip />
              </div>
            </>
          )}
        </div>
      ),
      options: {
        duration: 3000,
      },
    });
  }

  function tokenReceived(token, isNft = false) {
    spawn({
      icon: (
        <TokenIcon
          category={token.category}
          nft_commitment={token.nft_commitment}
          size={64}
          toggleable={false}
        />
      ),
      header: `${token.symbol} ${translate(translations.received)}`,
      body: <TokenAmount token={token} nft={isNft} />,
      options: {
        duration: 3000,
      },
    });
  }

  function clipboardCopy(header, payload) {
    spawn({
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      header,
      body: <span className="flex text-sm break-all">{payload}</span>,
      options: { id: "clipboardCopy", duration: 2400 },
    });
  }

  function disconnected() {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header: translate(translations.notConnected),
      body: <span>{translate(translations.unableWhileDisconnected)}</span>,
      options: { id: "disconnected" },
    });
  }

  function authFail(actionText) {
    spawn({
      icon: <InsuranceOutlined className="text-4xl text-error" />,
      header: translate(translations.authFail),
      body: (
        <span>
          {actionText ? `"${actionText}"` : ""}{" "}
          {translate(translations.notApproved)}
        </span>
      ),
    });
  }

  function invalidScan(content) {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header: translate(translations.invalidQrCode),
      body: (
        <span className="flex flex-col text-sm break-all">
          <span className="mb-1">
            {translate(translations.invalidQrMessage)}
          </span>
          <span className="font-mono opacity-60 italic">{content}</span>
        </span>
      ),
      options: { id: "invalidScan", duration: 3000 },
    });
  }

  function expiredPayment() {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header: translate(translations.paymentExpired),
      body: null,
      options: { id: "expiredPayment", duration: 3000 },
    });
  }
}
