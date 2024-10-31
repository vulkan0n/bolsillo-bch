import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  LockOutlined,
  PushpinOutlined,
  VerifiedOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { setPreference, selectSecuritySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";
import { selectDeviceInfo } from "@/redux/device";
import { SettingsContext } from "./SettingsContext";
import LogService from "@/services/LogService";
import SecurityService, { AuthActions } from "@/services/SecurityService";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import { sha256 } from "@/util/hash";

import { translate } from "@/util/translations";
import translations from "./translations";

const Log = LogService("SecuritySettings");

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const { handleSettingsUpdate } = useContext(SettingsContext);
  const { authMode, pinHash, authActions } = useSelector(
    selectSecuritySettings
  );
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

  const handleSetAuthActions = (action) => {
    Log.debug("handleSetAuthActions", action, authActions);

    let newAuthActions;

    if (authActions.includes(action)) {
      newAuthActions = authActions.filter((a) => a !== action);
    } else {
      newAuthActions = [...authActions, action];
    }

    Log.debug("handleSetAuthActions dispatch", newAuthActions.join(";"));
    dispatch(
      setPreference({ key: "authActions", value: newAuthActions.join(";") })
    );
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
      {authMode !== "none" && pinHash !== "" && (
        <>
          <div className="text-lg font-semibold bg-zinc-600 text-white p-1">
            Require authorization for:
          </div>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authWalletActivate)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.WalletActivate)}
              onChange={() => handleSetAuthActions(AuthActions.WalletActivate)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authRevealBalance)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.RevealBalance)}
              onChange={() => handleSetAuthActions(AuthActions.RevealBalance)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authSendTransaction)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.SendTransaction)}
              onChange={() => handleSetAuthActions(AuthActions.SendTransaction)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authInstantPay)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.SendTransaction)}
              onChange={() => handleSetAuthActions(AuthActions.SendTransaction)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authRevealPrivateKeys)}
          >
            <input
              type="checkbox"
              checked={authActions.includes(AuthActions.SendTransaction)}
              disabled={authActions.includes(AuthActions.RevealPrivateKeys)}
              onChange={() =>
                handleSetAuthActions(AuthActions.RevealPrivateKeys)
              }
            />
          </Accordion.Child>
        </>
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
