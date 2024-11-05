import { useNavigate } from "react-router-dom";
import { PlusCircleOutlined, ImportOutlined } from "@ant-design/icons";

import WalletManagerService from "@/services/WalletManagerService";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SettingsWalletWizardInit() {
  const navigate = useNavigate();

  const handleCreateWallet = async () => {
    const wallet = await WalletManagerService().createWallet(
      translate(translations.newWallet)
    );
    navigate(`/settings/wallet/${wallet.walletHash}`, { replace: true });
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
        {translate(translations.createNewWallet)}
      </button>
      <button
        type="button"
        onClick={handleImportWallet}
        className="bg-secondary text-white w-full rounded p-4 my-3"
      >
        <ImportOutlined className="mr-2 text-2xl" />
        {translate(translations.importWalletFromPhrase)}
      </button>
    </>
  );
}
