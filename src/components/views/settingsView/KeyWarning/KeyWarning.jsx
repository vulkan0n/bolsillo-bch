import { Link } from "react-router-dom";
import { WarningFilled } from "@ant-design/icons";

import { translate } from "@/util/translations";
import translations from "./translations";

const { backUpWallet } = translations;

export default function KeyWarning({ wallet }) {
  return wallet.key_viewed === null ? (
    <div className="mb-2 p-2">
      <Link to={`/settings/wallet/${wallet.id}`}>
        <div className="alert alert-warning p-2 shadow-lg bg-warning text-black rounded-lg text-center">
          <div className="text-xl">
            <WarningFilled className="text-error text-4xl ml-2" />
            {translate(backUpWallet)}
          </div>
        </div>
      </Link>
    </div>
  ) : null;
}
