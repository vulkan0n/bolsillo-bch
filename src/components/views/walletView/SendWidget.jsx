import { Link, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { Camera } from "@capacitor/camera";
import { useSelector, useDispatch } from "react-redux";
import { selectScannerIsScanning, setScannerIsScanning } from "@/redux/device";
import {
  PictureOutlined,
  SendOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { validateInvoiceString } from "@/util/invoice";
import QrScanner from "qr-scanner";
import Button from "@/components/atoms/Button";
import HrLabel from "@/components/atoms/HrLabel";
import ScannerButton from "./ScannerButton";

export default function SendWidget() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isScanning = useSelector(selectScannerIsScanning);

  const pasteAddressFromClipboard = async () => {
    const paste = (await Clipboard.read()).value;
    const valid = forwardOnValidAddress(paste);

    if (!valid) {
      // TODO: toast that we can't paste here
    }
  };

  const forwardOnValidAddress = (input) => {
    // go to send screen when valid address is entered
    const { isValid, address, query } = validateInvoiceString(input);

    // decoder function returns object on success, string on error
    if (isValid) {
      navigate(`/wallet/send/${address}${query}`);
    }

    return isValid;
  };

  const handleImageSelectButton = async () => {
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
        const result = await QrScanner.scanImage(scaledImage);
        forwardOnValidAddress(result);
        console.log(result);
      } catch (e) {
        console.error(e);
      }
    };
  };

  const handleHistoryButton = () => {
    navigate("/wallet/history");
  };

  return (
    <>
      <div className="mb-3.5">{!isScanning && <hr />}</div>
      <div className="flex items-center w-auto mx-4 justify-evenly">
        {!isScanning && (
          <Button
            icon={HistoryOutlined}
            label="History"
            onClick={handleHistoryButton}
            iconSize="2xl"
          />
        )}
        <ScannerButton />
        {!isScanning && (
          <Button
            icon={SendOutlined}
            label="Send"
            onClick={pasteAddressFromClipboard}
            iconSize="2xl"
          />
        )}
      </div>
    </>
  );
}
