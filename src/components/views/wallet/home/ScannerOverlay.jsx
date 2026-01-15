import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { QrcodeOutlined } from "@ant-design/icons";
import { selectInstantPaySettings } from "@/redux/preferences";

import Satoshi from "@/atoms/Satoshi";
import Overlay from "@/atoms/Overlay";
import WalletViewButtons from "@/views/wallet/home/WalletViewButtons";

import { useScanner } from "@/hooks/useScanner";

import { navigateOnValidUri } from "@/util/uri";

export default function ScannerOverlay() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScan = useCallback(
    async (scanContent, { spawnScanToast, spawnInvalidScanToast }) => {
      const { navTo, navState } = await navigateOnValidUri(scanContent);
      if (navTo !== "") {
        spawnScanToast();
        navigate(navTo, { state: { ...location.state, ...navState } });
      } else {
        spawnInvalidScanToast();
      }
    },
    [location.state, navigate]
  );

  useScanner(handleScan);

  const { isInstantPayEnabled, instantPayThreshold } = useSelector(
    selectInstantPaySettings
  );
  return (
    <Overlay transparent>
      <div className="flex justify-center items-center w-full h-full">
        {isInstantPayEnabled && (
          <div className="relative bottom-4 bg-black/50 text-white/80 rounded-sm z-10">
            <div className="text-3xl font-bold">Instant Pay Enabled</div>
            <div className="text-xl font-semibold">
              Threshold: <Satoshi value={instantPayThreshold} />
            </div>
          </div>
        )}
        <div
          className="w-72 h-72 rounded-xl flex items-center justify-center border border-4 border-primary opacity-90 mb-32"
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
