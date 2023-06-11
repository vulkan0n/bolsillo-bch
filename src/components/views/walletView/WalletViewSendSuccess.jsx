import { useNavigate } from "react-router-dom";
import { CheckCircleFilled } from "@ant-design/icons";
import { logos } from "@/util/logos";
import { selectPreferences } from "@/redux/preferences";

import { translate, translations } from "@/util/translations";

const { transactionSent, tapAnywhereToContinue } =
  translations.views.walletView.WalletViewSendSuccess;

function WalletViewSendSuccess() {
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 bg-primary text-white"
      onClick={() => navigate("/")}
    >
      <div className="flex items-center justify-center p-4 h-56 bg-zinc-800">
        <img src={logos.selene.img} className="h-full" />
      </div>
      <div className="p-4 text-center font-semibold">
        <div className="text-4xl">
          {translate(transactionSent, preferencesLanguageCode)}
        </div>
        <div className="flex items-center py-4 my-2">
          <CheckCircleFilled style={{ fontSize: "6rem" }} />
          <div className="flex-1">
            <ul>
              <li>
                {translate(tapAnywhereToContinue, preferencesLanguageCode)}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendSuccess;
