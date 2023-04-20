import { useNavigate } from "react-router-dom";
import { PlusCircleOutlined, ImportOutlined } from "@ant-design/icons";

import WalletService from "@/services/WalletService";

export default function SettingsWalletWizardInit() {
  const navigate = useNavigate();

  const handleCreateWallet = () => {
    const wallet = new WalletService().createWallet("New Wallet");
    navigate(`/settings/wallet/${wallet.id}`, { replace: true });
  };

  const handleImportWallet = () => {
    navigate(`/settings/wallet/wizard/import`);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCreateWallet}
        className="bg-secondary text-white w-full rounded p-4 my-3 text-xl"
      >
        <PlusCircleOutlined className="mr-2 text-2xl" />
        Create New Wallet
      </button>
      <button
        type="button"
        onClick={handleImportWallet}
        className="bg-secondary text-white w-full rounded p-4 my-3"
      >
        <ImportOutlined className="mr-2 text-2xl" />
        Import Wallet from Recovery Phrase
      </button>
    </>
  );
}
