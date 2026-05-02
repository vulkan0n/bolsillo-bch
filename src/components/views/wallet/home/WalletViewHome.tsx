import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp, ScanLine } from "lucide-react";

import { selectActiveWalletHash, selectGenesisHeight } from "@/redux/wallet";

import HomeHeader from "@/layout/HomeHeader";
import PocketBalance from "@/atoms/PocketBalance";
import ActionButton from "@/atoms/ActionButton";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";

import { useFormattedBalance } from "@/hooks/useFormattedBalance";

import HomeRecentTransactions from "./HomeRecentTransactions";

export default function WalletViewHome() {
  const navigate = useNavigate();
  const walletHash = useSelector(selectActiveWalletHash);
  const genesisHeight = useSelector(selectGenesisHeight);
  const { fiatAmount, fiatCurrency, bchAmount } = useFormattedBalance();

  return (
    <div className="bg-neutral-25 dark:bg-neutral-1000 pb-24 min-h-full">
      <HomeHeader />

      {genesisHeight > 0 && (
        <div className="px-5 mt-3">
          <KeyWarning walletHash={walletHash} />
        </div>
      )}

      <div className="px-5 mt-4">
        <div className="max-w-xs mx-auto">
          <PocketBalance
            fiatAmount={fiatAmount}
            fiatCurrency={fiatCurrency}
            bchAmount={bchAmount}
          />
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          <ActionButton
            icon={
              <ArrowDown
                className="w-6 h-6 text-brand-700 dark:text-brand-200"
                strokeWidth={1.75}
              />
            }
            label="Recibir"
            onClick={() => navigate("/wallet/receive")}
          />
          <ActionButton
            icon={
              <ArrowUp
                className="w-6 h-6 text-brand-700 dark:text-brand-200"
                strokeWidth={1.75}
              />
            }
            label="Enviar"
            onClick={() => navigate("/wallet/send")}
          />
          <ActionButton
            icon={
              <ScanLine
                className="w-6 h-6 text-brand-700 dark:text-brand-200"
                strokeWidth={1.75}
              />
            }
            label="Escanear"
            onClick={() => navigate("/wallet/scan")}
          />
        </div>
      </div>

      <HomeRecentTransactions />
    </div>
  );
}
