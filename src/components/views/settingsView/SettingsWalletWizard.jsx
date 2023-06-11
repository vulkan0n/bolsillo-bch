import { Outlet } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";

import ViewHeader from "@/components/views/ViewHeader";
import { logos } from "@/util/logos";
import { translate, translations } from "@/util/translations";
import { selectPreferences } from "@/redux/preferences";

const { createImportWallet } =
  translations.views.settingsView.SettingsWalletWizard;

export default function SettingsWalletWizard() {
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  return (
    <>
      <ViewHeader
        icon={PlusCircleOutlined}
        title={translate(createImportWallet, preferencesLanguageCode)}
      />
      <div className="flex items-center justify-center p-4 h-56 bg-zinc-800">
        <img src={logos.selene.img} className="h-full" />
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}
