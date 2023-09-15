/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from "prop-types";
import { PictureOutlined } from "@ant-design/icons";
import { Camera } from "@capacitor/camera";
import { Haptics } from "@capacitor/haptics";
import QrScanner from "qr-scanner";
import Button from "@/atoms/Button";
import translations from "./translations";
import { translate } from "@/util/translations";

export default function ImageSelectButton({ onSelection, ...rest }) {
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
      resultType: "dataUrl",
      source: "PHOTOS",
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
        onSelection(result.data);
        //console.log(result.data);
      } catch (e) {
        Haptics.notification({ type: "ERROR" });
        //console.error(e);
      }
    };
  };

  return (
    <Button
      icon={PictureOutlined}
      label={translate(translations.imageText)}
      onClick={handleImageSelectButton}
      {...rest}
    />
  );
}

ImageSelectButton.propTypes = {
  onSelection: PropTypes.func.isRequired,
};
