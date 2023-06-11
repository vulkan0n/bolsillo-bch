import { Link } from "react-router-dom";
import { WarningFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectPreferences } from "@/redux/preferences";

import { translations, translate } from "@/util/translations";

const { backUpWallet } = translations.views.settingsView.KeyWarning;

export default function KeyWarning({ wallet }) {
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  return wallet.key_viewed === null ? (
    <div className="mb-2 p-2">
      <Link to={`/settings/wallet/${wallet.id}`}>
        <div className="alert alert-warning p-2 shadow-lg bg-warning text-black rounded-lg text-center">
          <div className="text-xl">
            <WarningFilled className="text-error text-4xl ml-2" />
            {translate(backUpWallet, preferencesLanguageCode)}
          </div>
        </div>
      </Link>
    </div>
  ) : null;
}
