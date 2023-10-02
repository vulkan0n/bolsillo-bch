import { Link } from "react-router-dom";
import { CheckCircleFilled } from "@ant-design/icons";
import { logos } from "@/util/logos";

import { translate } from "@/util/translations";
import translations from "./translations";

function WalletViewSendSuccess() {
  return (
    <Link
      className="fixed top-0 left-0 w-screen h-screen z-50 bg-primary text-white"
      to="/"
    >
      <div className="flex items-center justify-center p-4 h-56 bg-zinc-800">
        <img src={logos.selene.img} className="h-full" alt="" />
      </div>
      <div className="p-4 text-center font-semibold">
        <div className="text-4xl">
          {translate(translations.transactionSent)}
        </div>
        <div className="flex items-center py-4 my-2">
          <CheckCircleFilled style={{ fontSize: "6rem" }} />
          <div className="flex-1">
            <ul>
              <li>{translate(translations.tapAnywhereToContinue)}</li>
            </ul>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WalletViewSendSuccess;
