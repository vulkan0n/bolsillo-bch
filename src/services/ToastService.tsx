import toast from "react-hot-toast";
import { logos } from "@/util/logos";
import Satoshi from "@/atoms/Satoshi";

export default function ToastService() {
  return {
    spawn,
    paymentReceived,
  };

  function spawn({ header, body, icon, options = {} }) {
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
          +<Satoshi value={amount} />
        </>
      ),
    });
  }
}

/*
 */
