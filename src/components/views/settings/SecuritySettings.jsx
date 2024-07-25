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

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { authMode, pinHash } = useSelector(selectSecuritySettings);
  const { hasBiometric } = useSelector(selectDeviceInfo);

  const handleSetPin = async () => {
    const isAuthorized = await SecurityService().authorize();
    if (isAuthorized || pinHash === "") {
      const { value: pin } = await Dialog.prompt({
        title: "Enter New PIN",
        message: "Please enter a **new** PIN.",
        okButtonTitle: "Set PIN",
      });
      const newPinHash = sha256.text(pin);

      const { value: confirmPin } = await Dialog.prompt({
        title: "Confirm New PIN",
        message: "Please confirm your new PIN.",
        okButtonTitle: "Confirm PIN",
      });
      const confirmPinHash = sha256.text(confirmPin);

      if (newPinHash === confirmPinHash) {
        dispatch(setPreference({ key: "pinHash", value: newPinHash }));
      } else {
        await Dialog.alert({
          message: "PIN confirmation did not match! PIN was not set.",
        });
      }
    }
  };

  const activeWallet = useSelector(selectActiveWallet);
  const isWalletKeyViewed = activeWallet.key_viewed !== null;

  return (
    <Accordion icon={LockOutlined} title="Security">
      <Accordion.Child icon={VerifiedOutlined} label="Security Mode">
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
            <option value="none">None</option>
            <option value="pin">PIN</option>
            {hasBiometric && <option value="bio">Biometric</option>}
          </select>
        )}
      </Accordion.Child>
      {authMode === "pin" && (
        <Accordion.Child>
          <div className="flex items-center justify-between">
            {pinHash === "" ? (
              <span className="text-error font-semibold">PIN is not set!</span>
            ) : (
              <span className="text-secondary font-semibold">PIN is set</span>
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
