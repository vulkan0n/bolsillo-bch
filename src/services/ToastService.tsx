import toast from "react-hot-toast";
import {
  SnippetsFilled,
  DisconnectOutlined,
  InsuranceOutlined,
} from "@ant-design/icons";
import { logos } from "@/util/logos";
import Satoshi from "@/atoms/Satoshi";
import TokenIcon from "@/atoms/TokenIcon";
import TokenAmount from "@/atoms/TokenAmount";

import translations from "@/views/wallet/translations";
import { translate } from "@/util/translations";

export default function ToastService() {
  return {
    spawn,
    paymentReceived,
    tokenReceived,
    clipboardCopy,
    disconnected,
    authFail,
  };

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
      header: "Payment received!",
      body: (
        <div className="flex flex-col">
          {token ? (
            <>
              <div>
                <TokenAmount token={token} />
              </div>
              <div className="text-secondary text-sm">
                +<Satoshi value={amount} fiat={false} />
              </div>
            </>
          ) : (
            <>
              <div className="text-secondary">
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

  function tokenReceived(token) {
    spawn({
      icon: <TokenIcon category={token.category} size={64} />,
      header: `${token.symbol} ${translate(translations.received)}`,
      body: <TokenAmount token={token} />,
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
}
