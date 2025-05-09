import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";

import { ScanOutlined, CloseOutlined } from "@ant-design/icons";

import { selectScannerIsScanning } from "@/redux/device";

import Button, { ValidSizes } from "@/atoms/Button";

import { navigateOnValidUri } from "@/util/uri";

import translations from "./translations";
import { translate } from "@/util/translations";

import { useScanner } from "@/hooks/useScanner";

export default function ScannerButton({
  label = true,
  size = "4xl",
  padding = "3",
}: {
  label?: boolean;
  size?: ValidSizes;
  padding?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isScanning = useSelector(selectScannerIsScanning);

  const handleScan = async (scanContent, spawnScanToast) => {
    const { navTo, navState } = await navigateOnValidUri(scanContent);
    if (navTo !== "") {
      spawnScanToast();
      navigate(navTo, { state: { ...location.state, ...navState } });
    }
  };

  const { toggleScanner } = useScanner(handleScan);

  const ScanIcon = isScanning ? CloseOutlined : ScanOutlined;
  const closeTranslation = translate(translations.close);
  const scanTranslation = translate(translations.scan);
  const scanLabel =
    (label && (isScanning ? closeTranslation : scanTranslation)) || "";
  const scanLabelColor = isScanning ? "text-white/80" : undefined;

  return (
    <Button
      icon={ScanIcon}
      outerLabel={scanLabel}
      outerLabelColor={scanLabelColor}
      iconSize={size}
      padding={padding}
      onClick={toggleScanner}
    />
  );
}
