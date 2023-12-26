import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { WarningFilled } from "@ant-design/icons";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function KeyWarning({ wallet }) {
  const { key_viewed, id: wallet_id } = wallet;

  if (key_viewed === null) {
    return <div />;
  }

  return (
    <div className="mb-2 p-2">
      <Link to={`/settings/wallet/${wallet_id}`}>
        <div className="alert alert-warning p-2 shadow-lg bg-warning text-black rounded-lg text-center">
          <div className="text-xl">
            <WarningFilled className="text-error text-4xl ml-2" />
            {translate(translations.backUpWallet)}
          </div>
        </div>
      </Link>
    </div>
  );
}

KeyWarning.propTypes = {
  wallet: PropTypes.object.isRequired,
};
