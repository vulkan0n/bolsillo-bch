import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { QrcodeOutlined } from "@ant-design/icons";
import { selectInstantPaySettings } from "@/redux/preferences";

import Satoshi from "@/atoms/Satoshi";
import Overlay from "@/atoms/Overlay";
import WalletViewButtons from "@/views/wallet/home/WalletViewButtons";

import { useScanner } from "@/hooks/useScanner";

import { navigateOnValidUri, validateBip21Uri } from "@/util/uri";
import { extractBchAddresses } from "@/util/cashaddr";
import { satsToBch } from "@/util/sats";

export default function ScannerOverlay({
  prefilledAmount = 0n,
}: {
  prefilledAmount?: bigint;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScan = useCallback(
    async (scanContent, { spawnScanToast, spawnInvalidScanToast }) => {
      let extracted = extractBchAddresses(scanContent)[0] || scanContent;

      // Append prefilled amount if:
      // - We have a prefilled amount
      // - Scanned URI doesn't already have an amount
      // - Scanned address is a non-token address (q address)
      const { isTokenAddress } = validateBip21Uri(extracted);
      const hasNoAmount = !scanContent.includes("?amount=");
      if (prefilledAmount > 0n && hasNoAmount && !isTokenAddress) {
        const amountBch = satsToBch(prefilledAmount).bch;
        extracted = `${extracted}?amount=${amountBch}`;
      }

      const { navTo, navState } = await navigateOnValidUri(extracted);
      if (navTo !== "") {
        spawnScanToast();
        navigate(navTo, { state: { ...location.state, ...navState } });
      } else {
        spawnInvalidScanToast();
      }
    },
    [location.state, navigate, prefilledAmount]
  );

  useScanner(handleScan);

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  return (
    <Overlay transparent>
      <div className="flex flex-col justify-center items-center w-full h-full">
        {isInstantPayEnabled && (
          <div className="mb-4 bg-black/50 text-white/80 rounded-sm z-10 text-center p-3 rounded-xl">
            <div className="text-3xl font-bold">Instant Pay Enabled</div>
            <div className="text-xl font-semibold">
              Threshold: <Satoshi value={instantPayThreshold} />
            </div>
            {prefilledAmount > 0n && (
              <div className="text-xl font-semibold">
                Prefilled: <Satoshi value={prefilledAmount} />
              </div>
            )}
          </div>
        )}
        <div
          className="w-72 h-72 rounded-xl flex items-center justify-center border border-4 border-primary opacity-90"
          style={{ boxShadow: "0 0 0 100vh #232323" }}
        >
          <QrcodeOutlined
            className="text-4xl opacity-80 text-primary border-2 border-primary rounded-sm"
            style={{ filter: "drop-shadow(0 0 4px #8dc351)" }}
          />
        </div>
      </div>

      <div className="align-end mb-[64px]">
        <WalletViewButtons />
      </div>
    </Overlay>
  );
}
