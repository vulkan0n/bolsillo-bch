import { useState, useEffect } from "react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { BulbOutlined } from "@ant-design/icons";
import Button from "@/components/atoms/Button";

export default function TorchButton(props) {
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);

  useEffect(function initializeTorchState() {
    const getTorchState = async () => {
      setIsTorchEnabled((await BarcodeScanner.getTorchState()).isEnabled);
    };

    getTorchState();
  }, []);

  const handleTorchButton = async () => {
    await (isTorchEnabled
      ? BarcodeScanner.disableTorch()
      : BarcodeScanner.enableTorch());

    setIsTorchEnabled(!isTorchEnabled);
  };

  return (
    <Button
      icon={BulbOutlined}
      label="Torch"
      onClick={handleTorchButton}
      inverted={isTorchEnabled}
      {...props}
    />
  );
}
