import toast from "react-hot-toast";
import {
  SnippetsFilled,
  DisconnectOutlined,
  SyncOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { logos } from "@/util/logos";
import Satoshi from "@/atoms/Satoshi";

export default function ToastService() {
  return {
    spawn,
    paymentReceived,
    connectionStatus,
    clipboardCopy,
    disconnected,
  };

  function spawn({ header, body, icon, options = undefined }) {
    toast.custom(
      (t) => (
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
            <div className="text-base text-zinc-600">{body}</div>
          </div>
        </div>
      ),
      options
    );
  }

  function paymentReceived(amount) {
    spawn({
      icon: (
        <img
          src={logos.selene.img}
          style={{ width: "64px", height: "64px" }}
          alt=""
        />
      ),
      header: "Payment received!",
      body: (
        <>
          <span className="text-secondary">
            +<Satoshi value={amount} />
          </span>
          <div className="text-zinc-500 font-mono text-sm">
            <Satoshi value={amount} flip />
          </div>
        </>
      ),
    });
  }

  function connectionStatus(sync) {
    const header = sync.connected
      ? `Connected to ${sync.server}`
      : "Disconnected";

    const pendingSum = Object.keys(sync.syncPending).reduce(
      (sum, cur) => sum + sync.syncPending[cur],
      0
    );

    /*
    const failedSum = Object.keys(sync.syncFailed).reduce(
      (sum, cur) => sum + sync.syncFailed[cur],
      0
      );*/

    spawn({
      header,
      body: (
        <div>
          {pendingSum > 0 && <div>Pending Requests: {pendingSum}</div>}
          <div>{Object.keys(sync.addresses).length} addresses synced</div>
        </div>
      ),
      icon:
        pendingSum > 0 ? (
          <SyncOutlined className="text-4xl text-zinc-800" />
        ) : (
          <CheckCircleFilled className="text-4xl text-primary" />
        ),
    });
  }

  function clipboardCopy(header, payload) {
    spawn({
      icon: <SnippetsFilled className="text-4xl text-primary" />,
      header: `Copied ${header} to Clipboard`,
      body: (
        <span className="inline-block max-w-[62%] truncate text-sm break-all">
          {payload}
        </span>
      ),
    });
  }

  function disconnected() {
    spawn({
      icon: <DisconnectOutlined className="text-4xl text-error" />,
      header: `Not Connected`,
      body: <span>Unable to perform action while disconnected</span>,
    });
  }
}

/*
 */
