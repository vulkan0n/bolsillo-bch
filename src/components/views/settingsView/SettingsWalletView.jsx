import { useParams } from "react-router-dom";
import { WalletOutlined } from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

export default function SettingsWalletView() {
  const { wallet_id } = useParams();

  const wallet = new WalletService().getWalletById(wallet_id);
  console.log("SettingsWalletView", wallet_id, wallet);
  return (
    <>
      <ViewHeader icon={WalletOutlined} title="Wallet Settings" />
      <div className="p-2">
        <ul>
          {Object.keys(wallet).map((key) => (
            <li key={key}>{`${key}: ${wallet[key]}`}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
