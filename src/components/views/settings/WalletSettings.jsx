import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  WalletOutlined,
  PlusCircleFilled,
  RightCircleOutlined,
  CheckCircleFilled,
  WarningFilled,
} from "@ant-design/icons";

import { selectActiveWalletId, selectBchNetwork } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";

import Accordion from "@/atoms/Accordion";
import WalletManagerService from "@/services/WalletManagerService";

export default function WalletSettings() {
  const bchNetwork = useSelector(selectBchNetwork);
  const walletList = WalletManagerService(bchNetwork).getWallets();
  const activeWalletId = useSelector(selectActiveWalletId);

  const { wallet_id } = useParams();
  const selectedWalletId = Number.parseInt(wallet_id || "0", 10);

  return (
    <Accordion
      icon={WalletOutlined}
      title={translate(translations.walletSettings)}
    >
      <Link
        to="/settings/wallet/wizard"
        className="w-full block p-2 flex items-center"
      >
        <PlusCircleFilled className="text-xl mr-1" />
        {translate(translations.createImportWallet)}
      </Link>
      {walletList.map((w) => (
        <Link
          key={w.id}
          to={`/settings/wallet/${w.id}`}
          className="w-full block p-2 flex items-center"
          replace
        >
          {w.id === selectedWalletId && (
            <RightCircleOutlined className="text-xl mr-1 text-secondary" />
          )}
          {w.id === activeWalletId && (
            <CheckCircleFilled className="text-xl mr-1 text-primary" />
          )}

          {w.key_viewed === null && (
            <WarningFilled className="text-xl mr-1 text-error" />
          )}
          {w.name}
        </Link>
      ))}
    </Accordion>
  );
}
