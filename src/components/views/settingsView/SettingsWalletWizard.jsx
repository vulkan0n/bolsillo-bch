import { useNavigate } from "react-router-dom";
import { PlusSquareOutlined } from "@ant-design/icons";

import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

export default function SettingsWalletWizard() {
  const navigate = useNavigate();

  const handleCreateWallet = () => {
    new WalletService().createWallet("New Wallet");
    navigate("/settings");
  };

  return (
    <>
      <ViewHeader icon={PlusSquareOutlined} title="Add Wallet" />
      <div className="p-1">
        <button type="button" onClick={handleCreateWallet}>
          Create Wallet
        </button>
      </div>
    </>
  );
}
