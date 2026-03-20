/* eslint-disable react/jsx-props-no-spreading */
import { useDispatch } from "react-redux";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import QrScanner from "qr-scanner";
import { PictureOutlined, ScanOutlined } from "@ant-design/icons";

import { setScannerIsScanning } from "@/redux/device";

import NotificationService from "@/kernel/app/NotificationService";

import translations from "@/views/wallet/translations";
import Button, { ButtonProps } from "@/atoms/Button";

import { Haptic } from "@/util/haptic";

import { translate } from "@/util/translations";

interface ImageSelectButtonProps extends ButtonProps {
  onSelection: (data: string) => void;
}

export default function ImageSelectButton({
  onSelection,
  ...rest
}: ImageSelectButtonProps) {
  const dispatch = useDispatch();
  // function to downscale images (helps QR codes read better)
  const scaleImage = (image) => {
    const maxWidth = 1920;
    const maxHeight = 1080;
    const scaleRatio = Math.min(
      1,
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight
    );

    const width = image.naturalWidth * scaleRatio;
    const height = image.naturalHeight * scaleRatio;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  };

  const handleImageSelectButton = async () => {
    // open OS image picker
    const { dataUrl } = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    // load and scan the chosen image
    const image = new Image();
    image.src = dataUrl;
    image.onload = async () => {
      const scaledImage = scaleImage(image);

      try {
        const result = await QrScanner.scanImage(scaledImage, {
          returnDetailedScanResult: true,
        });

        // Show scan content toast
        Haptic.success();
        NotificationService().spawn({
          icon: <ScanOutlined className="text-4xl" />,
          header: translate(translations.scanContents),
          body: <span className="flex break-all text-sm">{result.data}</span>,
        });

        onSelection(result.data);
      } catch (e) {
        // No QR code found - show invalid scan toast with error
        const errorMessage = e?.message || "No QR code found";
        NotificationService().invalidScan(errorMessage);
        onSelection("");
      }

      dispatch(setScannerIsScanning(false));
    };
  };

  return (
    <Button
      icon={PictureOutlined}
      outerLabel={translate(translations.imageText)}
      onClick={handleImageSelectButton}
      {...rest}
    />
  );
}
