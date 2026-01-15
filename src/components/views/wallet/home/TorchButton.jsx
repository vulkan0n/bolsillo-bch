/* eslint-disable react/jsx-props-no-spreading */
import { useSelector, useDispatch } from "react-redux";
import { BulbOutlined } from "@ant-design/icons";

import { selectTorchIsEnabled, setTorchIsEnabled } from "@/redux/device";

import LogService from "@/services/LogService";

import Button from "@/atoms/Button";

import { translate } from "@/util/translations";
import translations from "@/views/wallet/translations";

const Log = LogService("TorchButton");

export default function TorchButton(props) {
  const dispatch = useDispatch();
  const isTorchEnabled = useSelector(selectTorchIsEnabled);

  const handleTorchButton = async () => {
    Log.debug("handleTorchButton", isTorchEnabled, "to", !isTorchEnabled);
    dispatch(setTorchIsEnabled(!isTorchEnabled));
  };

  return (
    <Button
      icon={BulbOutlined}
      outerLabel={translate(translations.torch)}
      onClick={handleTorchButton}
      inverted={isTorchEnabled}
      {...props}
    />
  );
}
