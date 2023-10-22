import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  WalletOutlined,
  PlusCircleFilled,
  CheckCircleOutlined,
} from "@ant-design/icons";

import { selectActiveWalletId } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";

import Accordion from "@/atoms/Accordion";
import WalletManagerService from "@/services/WalletManagerService";

export default function WalletSettings() {
  const walletList = WalletManagerService().getWallets();
  const activeWalletId = useSelector(selectActiveWalletId);

  return (
    <Accordion
      icon={WalletOutlined}
      title={translate(translations.walletSettings)}
    >
      <Link to="/settings/wallet/wizard" className="w-full block p-2">
        <PlusCircleFilled className="text-xl mr-1" />
        {translate(translations.createImportWallet)}
      </Link>
      {walletList.map((w) => (
        <Link
          key={w.id}
          to={`/settings/wallet/${w.id}`}
          className="w-full block p-2"
        >
          {w.id === activeWalletId && (
            <CheckCircleOutlined className="text-xl mr-1 text-secondary" />
          )}
          {w.name}
        </Link>
      ))}
    </Accordion>
  );
}
