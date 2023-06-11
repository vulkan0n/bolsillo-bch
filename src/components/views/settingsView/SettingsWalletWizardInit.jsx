import { useNavigate } from "react-router-dom";
import { PlusCircleOutlined, ImportOutlined } from "@ant-design/icons";

import WalletService from "@/services/WalletService";

import { translate, translations } from "@/util/translations";
import { selectPreferences } from "@/redux/preferences";

const { newWallet, createNewWallet, importWalletFromPhrase } =
  translations.views.settingsView.SettingsWalletWizardInit;

export default function SettingsWalletWizardInit() {
  const navigate = useNavigate();
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];

  const handleCreateWallet = () => {
    const wallet = new WalletService().createWallet(translate(newWallet));
    navigate(`/settings/wallet/${wallet.id}`, { replace: true });
  };

  const handleImportWallet = () => {
    navigate(`/settings/wallet/wizard/import`, { replace: true });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCreateWallet}
        className="bg-primary text-white w-full rounded p-4 my-3 text-xl"
      >
        <PlusCircleOutlined className="mr-2 text-2xl" />
        {translate(createNewWallet, preferencesLanguageCode)}
      </button>
      <button
        type="button"
        onClick={handleImportWallet}
        className="bg-secondary text-white w-full rounded p-4 my-3"
      >
        <ImportOutlined className="mr-2 text-2xl" />
        {translate(importWalletFromPhrase, preferencesLanguageCode)}
      </button>
    </>
  );
}
