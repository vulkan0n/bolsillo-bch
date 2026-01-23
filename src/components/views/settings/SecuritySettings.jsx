import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clipboard } from "@capacitor/clipboard";
import { Dialog } from "@capacitor/dialog";
import { Share } from "@capacitor/share";
import {
  LockOutlined,
  PushpinOutlined,
  VerifiedOutlined,
  WalletOutlined,
  EyeInvisibleOutlined,
  SendOutlined,
  ThunderboltOutlined,
  KeyOutlined,
  ShopOutlined,
  CloudSyncOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  setPreference,
  selectSecuritySettings,
  selectEncryptionSettings,
} from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";
import { selectDeviceInfo } from "@/redux/device";
import { SettingsContext } from "./SettingsContext";
import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import NotificationService from "@/kernel/app/NotificationService";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import { translate } from "@/util/translations";
import translations from "./translations";
import Select from "@/components/atoms/Select";

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const { handleSettingsUpdate } = useContext(SettingsContext);

  const Security = SecurityService();
  const Notification = NotificationService();
  const [isPinConfigured, setIsPinConfigured] = useState(
    Security.isPinConfigured()
  );
  const { authMode, authActions } = useSelector(selectSecuritySettings);
  const { hasBiometric, platform } = useSelector(selectDeviceInfo);
  const { isDeviceOnly, lastKeyBackupExport } = useSelector(
    selectEncryptionSettings
  );
  const isEncryptionReady = Security.isEncryptionReady();

  const activeWallet = useSelector(selectActiveWallet);

  const handleSetPin = async () => {
    if (isPinConfigured) {
      const isAuthorized = await Security.authorize(AuthActions.Any);
      if (!isAuthorized) {
        return;
      }
    }

    const { value: pin } = await Dialog.prompt({
      title: translate(translations.enterNewPin),
      message: translate(translations.enterNewPinMessage),
      okButtonTitle: translate(translations.enterNewPinOkButtonTitle),
    });
    if (!pin) {
      return;
    }

    const { value: confirmPin } = await Dialog.prompt({
      title: translate(translations.confirmNewPin),
      message: translate(translations.confirmNewPinMessage),
      okButtonTitle: translate(translations.confirmNewPinOkButtonTitle),
    });

    if (pin === confirmPin) {
      try {
        await Security.changePinAndUpdateBiometric(pin, hasBiometric);
      } catch (e) {
        Notification.error(translate(translations.error), String(e));
        return;
      }
      setIsPinConfigured(true);
    } else {
      Notification.error(translate(translations.pinConfirmationDidNotMatch));
    }
  };

  const handleSetAuthActions = async (action) => {
    let newAuthActions;

    if (authActions.includes(action)) {
      // require auth to disable any auth setting
      const isAuthorized = await Security.authorize(AuthActions.Any);
      if (!isAuthorized) {
        return;
      }

      newAuthActions = authActions.filter((a) => a !== action);
    } else {
      newAuthActions = [...authActions, action];
    }

    dispatch(
      setPreference({ key: "authActions", value: newAuthActions.join(";") })
    );
  };

  const isWalletKeyViewed = activeWallet.key_viewed_at !== null;

  // Shared helper: prompt for password, export key backup, share/copy result.
  // Returns true on success, false if user cancelled or export failed.
  const performKeyBackupExport = async (promptMessage) => {
    const { value: password } = await Dialog.prompt({
      title: translate(translations.exportKeyBackup),
      message: promptMessage,
      inputPlaceholder: translate(translations.enterPassword),
    });

    if (!password) {
      return false;
    }

    if (password.length < 8) {
      Notification.error(translate(translations.passwordTooShort));
      return false;
    }

    const { value: confirmPassword } = await Dialog.prompt({
      title: translate(translations.confirmPassword),
      message: translate(translations.confirmPasswordMessage),
      inputPlaceholder: translate(translations.enterPassword),
    });

    if (password !== confirmPassword) {
      Notification.error(translate(translations.passwordMismatch));
      return false;
    }

    try {
      const data = await Security.exportKeyBackup(password);

      if ((await Share.canShare()).value) {
        await Share.share({
          title: translate(translations.encryptionKeyBackupTitle),
          text: data,
        });
      } else {
        await Clipboard.write({ string: data });
        Notification.success(translate(translations.backupCopiedToClipboard));
      }

      dispatch(
        setPreference({
          key: "lastKeyBackupExport",
          value: new Date().toISOString(),
        })
      );
      return true;
    } catch (e) {
      Notification.error(translate(translations.error), String(e));
      return false;
    }
  };

  const handleDeviceOnlyToggle = async () => {
    const shouldEnableDeviceOnly = !isDeviceOnly;

    if (shouldEnableDeviceOnly) {
      // Gate 1: Check ALL wallets have seed phrase viewed
      if (!Security.allWalletsSeedViewed()) {
        Notification.error(translate(translations.seedPhraseNotViewed));
        return;
      }

      // Gate 2: Force key backup export
      const isExported = await performKeyBackupExport(
        translate(translations.backupRequiredForDeviceOnly)
      );
      if (!isExported) {
        return;
      }
    }

    // Final confirmation
    const warningMessage = shouldEnableDeviceOnly
      ? translate(translations.deviceOnlyEnableWarning)
      : translate(translations.deviceOnlyDisableWarning);

    const { value: isConfirmed } = await Dialog.confirm({
      title: translate(translations.deviceOnlyKeys),
      message: warningMessage,
    });

    if (isConfirmed) {
      try {
        await Security.setDeviceOnlyMode(shouldEnableDeviceOnly);
        dispatch(
          setPreference({
            key: "encryptionDeviceOnly",
            value: shouldEnableDeviceOnly.toString(),
          })
        );
      } catch (e) {
        Notification.error(translate(translations.error), String(e));
      }
    }
  };

  const handleAuthModeChange = async (event) => {
    const { value } = event.target;

    let isAuthorized = false;
    // force biometric prompt if switching to bio
    if (hasBiometric && value === "bio") {
      isAuthorized = await Security.authorizeBio(AuthActions.Any);
    } else {
      isAuthorized = await Security.authorize(AuthActions.Any);
    }

    if (!isAuthorized) {
      return;
    }

    // If switching away from PIN mode, remove PIN from plugin.
    // Biometric key (if any) is stored independently in platform keychain.
    if (authMode === "pin" && value !== "pin" && isPinConfigured) {
      try {
        await Security.removePin();
        setIsPinConfigured(false);
      } catch (e) {
        Notification.error(translate(translations.error), String(e));
        return;
      }
    }
    handleSettingsUpdate("authMode", value);
  };

  const handleExportBackup = async () => {
    const isAuthorized = await Security.authorize(AuthActions.Any);
    if (!isAuthorized) {
      return;
    }
    await performKeyBackupExport(
      translate(translations.exportKeyBackupMessage)
    );
  };

  const handleImportBackup = async () => {
    const isAuthorized = await Security.authorize(AuthActions.Any);
    if (!isAuthorized) {
      return;
    }

    const { value: data } = await Dialog.prompt({
      title: translate(translations.importKeyBackup),
      message: translate(translations.importKeyBackupMessage),
      inputPlaceholder: translate(translations.pasteBackupData),
    });

    if (!data) {
      return;
    }

    const { value: password } = await Dialog.prompt({
      title: translate(translations.enterBackupPassword),
      message: translate(translations.enterBackupPasswordMessage),
      inputPlaceholder: translate(translations.enterPassword),
    });

    if (!password) {
      return;
    }

    try {
      const result = await Security.importKeyBackup(data, password);

      if (result.isKeyMismatch) {
        Notification.error(
          translate(translations.error),
          translate(translations.keyMismatch)
        );
        return;
      }

      if (result.failedFiles.length > 0) {
        Notification.error(
          translate(translations.warning),
          translate(translations.reencryptionPartialFailure)
        );
      } else {
        Notification.success(translate(translations.reencryptionSuccess));
      }
    } catch (e) {
      Notification.error(translate(translations.error), String(e));
    }
  };

  return (
    <Accordion icon={LockOutlined} title={translate(translations.security)}>
      <Accordion.Child
        icon={VerifiedOutlined}
        label={translate(translations.securityMode)}
        description={translate(translations.securityModeExplanation)}
      >
        {!isWalletKeyViewed ? (
          <KeyWarning walletHash={activeWallet.walletHash} />
        ) : (
          <Select
            className="w-fit"
            value={authMode}
            disabled={!isWalletKeyViewed}
            onChange={handleAuthModeChange}
          >
            <option value="none">{translate(translations.none)}</option>
            <option value="pin">{translate(translations.pin)}</option>
            {hasBiometric && (
              <option value="bio">{translate(translations.biometric)}</option>
            )}
          </Select>
        )}
      </Accordion.Child>
      {authMode === "pin" && (
        <Accordion.Child>
          <div className="flex items-center justify-between w-full">
            {!isPinConfigured ? (
              <span className="text-error font-semibold">
                {translate(translations.pinNotSet)}
              </span>
            ) : (
              <span className="text-success-dark font-semibold">
                {translate(translations.pinSet)}
              </span>
            )}
            <Button
              onClick={handleSetPin}
              icon={PushpinOutlined}
              label={translate(translations.resetPin)}
            />
          </div>
        </Accordion.Child>
      )}
      {authMode !== "none" && (isPinConfigured || authMode === "bio") && (
        <>
          <div className="text-lg font-semibold bg-neutral-600 text-neutral-100 p-1">
            {translate(translations.requireAuthorizationFor)}
          </div>
          <Accordion.Child
            icon={LockOutlined}
            label={translate(translations.appLock)}
            description={translate(translations.appLockDescription)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.AppOpen)}
              onChange={() => handleSetAuthActions(AuthActions.AppOpen)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={LockOutlined}
            label={translate(translations.appResume)}
            description={translate(translations.appResumeDescription)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.AppResume)}
              onChange={() => handleSetAuthActions(AuthActions.AppResume)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={WalletOutlined}
            label={translate(translations.authWalletActivate)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.WalletActivate)}
              onChange={() => handleSetAuthActions(AuthActions.WalletActivate)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={EyeInvisibleOutlined}
            label={translate(translations.authRevealBalance)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.RevealBalance)}
              onChange={() => handleSetAuthActions(AuthActions.RevealBalance)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={SendOutlined}
            label={translate(translations.authSendTransaction)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.SendTransaction)}
              onChange={() => handleSetAuthActions(AuthActions.SendTransaction)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ThunderboltOutlined}
            label={translate(translations.authInstantPay)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.InstantPay)}
              onChange={() => handleSetAuthActions(AuthActions.InstantPay)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={KeyOutlined}
            label={translate(translations.authRevealPrivateKeys)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.RevealPrivateKeys)}
              disabled={authActions.includes(AuthActions.RevealPrivateKeys)}
              onChange={() =>
                handleSetAuthActions(AuthActions.RevealPrivateKeys)
              }
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ShopOutlined}
            label={translate(translations.authVendorMode)}
          >
            <Checkbox
              checked={authActions.includes(AuthActions.VendorMode)}
              onChange={() => handleSetAuthActions(AuthActions.VendorMode)}
            />
          </Accordion.Child>
        </>
      )}
      {platform === "web" && (
        <div className="flex items-center gap-2 p-2 m-1 mt-4 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-sm">
          <InfoCircleOutlined />
          <span>{translate(translations.webEncryptionWarning)}</span>
        </div>
      )}
      {platform !== "web" && isEncryptionReady && (
        <>
          <div className="text-lg font-semibold bg-neutral-600 text-neutral-100 p-1 mt-4">
            {translate(translations.encryptionSettings)}
          </div>
          <Accordion.Child
            icon={CloudSyncOutlined}
            label={translate(translations.deviceOnlyKeys)}
            description={translate(translations.deviceOnlyKeysDescription)}
          >
            <Checkbox
              checked={isDeviceOnly}
              onChange={handleDeviceOnlyToggle}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ExportOutlined}
            label={translate(translations.exportKeyBackup)}
            description={translate(translations.exportKeyBackupDescription)}
          >
            <Button
              onClick={handleExportBackup}
              icon={ExportOutlined}
              label={translate(translations.exportButton)}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ImportOutlined}
            label={translate(translations.importKeyBackup)}
            description={translate(translations.importKeyBackupDescription)}
          >
            <Button
              onClick={handleImportBackup}
              icon={ImportOutlined}
              label={translate(translations.importButton)}
            />
          </Accordion.Child>
          {lastKeyBackupExport && (
            <Accordion.Child
              icon={InfoCircleOutlined}
              label={translate(translations.lastKeyBackup)}
            >
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(lastKeyBackupExport).toLocaleDateString()}
              </span>
            </Accordion.Child>
          )}
        </>
      )}
    </Accordion>
  );
}
