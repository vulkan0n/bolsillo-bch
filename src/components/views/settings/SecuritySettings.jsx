import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  LockOutlined,
  PushpinOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import { setPreference, selectSecuritySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";
import { selectDeviceInfo } from "@/redux/device";
import { SettingsContext } from "./SettingsContext";
import SecurityService from "@/services/SecurityService";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import { sha256 } from "@/util/hash";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { authMode, pinHash } = useSelector(selectSecuritySettings);
  const { hasBiometric } = useSelector(selectDeviceInfo);

  const handleSetPin = async () => {
    const isAuthorized = await SecurityService().authorize();
    if (isAuthorized || pinHash === "") {
      const { value: pin } = await Dialog.prompt({
        title: translate(translations.enterNewPin),
        message: translate(translations.enterNewPinMessage),
        okButtonTitle: translate(translations.enterNewPinOkButtonTitle),
      });
      const newPinHash = sha256.text(pin);

      const { value: confirmPin } = await Dialog.prompt({
        title: translate(translations.confirmNewPin),
        message: translate(translations.confirmNewPinMessage),
        okButtonTitle: translate(translations.confirmNewPinOkButtonTitle),
      });
      const confirmPinHash = sha256.text(confirmPin);

      if (newPinHash === confirmPinHash) {
        dispatch(setPreference({ key: "pinHash", value: newPinHash }));
      } else {
        await Dialog.alert({
          message: translate(translations.pinConfirmationDidNotMatch),
        });
      }
    }
  };

  const activeWallet = useSelector(selectActiveWallet);
  const isWalletKeyViewed = activeWallet.key_viewed !== null;

  return (
    <Accordion icon={LockOutlined} title={translate(translations.security)}>
      <Accordion.Child
        icon={VerifiedOutlined}
        label={translate(translations.securityMode)}
        description={translate(translations.securityModeExplanation)}
      >
        {!isWalletKeyViewed ? (
          <KeyWarning wallet={activeWallet} />
        ) : (
          <select
            className="p-2 bg-white rounded h-10 w-fit"
            value={authMode}
            disabled={!isWalletKeyViewed}
            onChange={async (event) => {
              const { value } = event.target;
              const isAuthorized = await SecurityService().authorize();
              if (isAuthorized) {
                handleSettingsUpdate("authMode", value);
              }
            }}
          >
            <option value="none">{translate(translations.none)}</option>
            <option value="pin">{translate(translations.pin)}</option>
            {hasBiometric && (
              <option value="bio">{translate(translations.biometric)}</option>
            )}
          </select>
        )}
      </Accordion.Child>
      {authMode === "pin" && (
        <Accordion.Child>
          <div className="flex items-center justify-between">
            {pinHash === "" ? (
              <span className="text-error font-semibold">
                {translate(translations.pinNotSet)}
              </span>
            ) : (
              <span className="text-secondary font-semibold">
                {translate(translations.pinSet)}
              </span>
            )}
            <Button onClick={handleSetPin} icon={PinSetButtonIcon} />
          </div>
        </Accordion.Child>
      )}
    </Accordion>
  );
}

function PinSetButtonIcon() {
  return (
    <span>
      <PushpinOutlined className="mr-1" />
      Reset PIN
    </span>
  );
}
