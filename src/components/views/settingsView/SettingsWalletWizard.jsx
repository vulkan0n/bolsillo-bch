import { useNavigate } from "react-router-dom";
import {
  PlusCircleOutlined,
  ImportOutlined,
} from "@ant-design/icons";

import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

import { logos } from "@/util/logos";

export default function SettingsWalletWizard() {
  const navigate = useNavigate();

  const handleCreateWallet = () => {
    const wallet = new WalletService().createWallet("New Wallet");
    navigate(`/settings/wallet/${wallet.id}`);
  };

  const handleImportWallet = () => {};

  return (
    <div className="bg-zinc-300 h-full">
      <ViewHeader icon={PlusCircleOutlined} title="Create/Import Wallet" />
      <div className="flex items-center justify-center p-8 h-1/2 bg-zinc-800">
        <img src={logos.selene.img} class="p-8" />
      </div>
      <div className="p-4 rounded-b-lg mt-2">
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
      </div>
    </div>
  );
}
