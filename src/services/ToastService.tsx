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

export default function ToastService() {
  return {
    spawn,
    paymentReceived,
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
            <div className="text-lg font-bold text-zinc-800">{header}</div>
            <div className="text-base text-zinc-600 flex">{body}</div>
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
          {token && (
            <div>
              <TokenAmount token={token} />
            </div>
          )}
          <div className="text-secondary">
            +<Satoshi value={amount} />
          </div>
          <div className="text-zinc-500 font-mono text-sm">
            <Satoshi value={amount} flip />
          </div>
        </div>
      ),
      options: {
        id: "paymentReceived",
        duration: 2000,
      },
    });
  }

  function clipboardCopy(header, payload) {
    spawn({
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      header,
      body: <span className="flex text-sm break-all">{payload}</span>,
      options: { id: "clipboardCopy", duration: 2500 },
    });
  }

  function disconnected() {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header: `Not Connected`,
      body: <span>Unable to perform action while disconnected</span>,
      options: { id: "disconnected" },
    });
  }

  function authFail(actionText) {
    spawn({
      icon: <InsuranceOutlined className="text-4xl text-error" />,
      header: `Authorization Failed`,
      body: (
        <span>
          Action {actionText ? `'${actionText}'` : ""} was not approved.
        </span>
      ),
    });
  }
}
