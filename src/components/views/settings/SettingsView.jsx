import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  InAppBrowser,
  DefaultSystemBrowserOptions,
} from "@capacitor/inappbrowser";

import { SettingOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import {
  selectPreferences,
  setPreference,
  selectActiveWalletHash,
} from "@/redux/preferences";

import ViewHeader from "@/layout/ViewHeader";
import FullColumn from "@/layout/FullColumn";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import Button from "@/atoms/Button";
import SeleneLogo from "@/atoms/SeleneLogo";

import { selectDevicePlatform } from "@/redux/device";

import { translate } from "@/util/translations";
import translations from "./translations";

import { SELENE_WALLET_VERSION } from "@/util/version";

import { SettingsContext } from "./SettingsContext";

import WalletSettings from "./WalletSettings";
import CurrencySettings from "./CurrencySettings";
import PaymentSettings from "./PaymentSettings";
import QrCodeSettings from "./QrCodeSettings";
import IntlSettings from "./IntlSettings";
import NetworkSettings from "./NetworkSettings";
import SecuritySettings from "./SecuritySettings";
import UiSettings from "./UiSettings";
import PrivacySettings from "./PrivacySettings";

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

  const platform = useSelector(selectDevicePlatform);

  const handleSettingsUpdate = useCallback(
    (key, value) => {
      dispatch(setPreference({ key, value }));
    },
    [dispatch]
  );

  const settingsContext = useMemo(
    () => ({
      handleSettingsUpdate,
      preferences,
      dispatch,
    }),
    [dispatch, preferences, handleSettingsUpdate]
  );

  const activeWalletHash = useSelector(selectActiveWalletHash);

  const handleHelpButton = async () => {
    if (platform === "web") {
      window.open("https://docs.selene.cash");
    } else {
      await InAppBrowser.openInSystemBrowser({
        url: "https://docs.selene.cash",
        options: DefaultSystemBrowserOptions,
      });
    }
  };

  return (
    <FullColumn>
      <ViewHeader
        icon={SettingOutlined}
        title={translate(translations.settings)}
      />
      <div className="p-1">
        <SettingsContext.Provider value={settingsContext}>
          <KeyWarning walletHash={activeWalletHash} />
          <WalletSettings />
          <SecuritySettings />
          <CurrencySettings />
          <PaymentSettings />
          <QrCodeSettings />
          <UiSettings />
          <NetworkSettings />
          <PrivacySettings />
          <IntlSettings />
        </SettingsContext.Provider>
      </div>
      <div className="flex gap-x-2 justify-center items-center p-1 pb-4 mx-1">
        <Button
          navigateTo="/credits"
          label={
            <span className="font-semibold">
              Selene Wallet v{SELENE_WALLET_VERSION}
            </span>
          }
          icon={SeleneLogo}
          iconClasses="w-[44px] h-[44px]"
          padding="1"
          inverted
          fullWidth
        />
        <Button
          onClick={handleHelpButton}
          label="Help"
          labelSize="xl"
          icon={QuestionCircleOutlined}
          iconSize="3xl"
          padding="2"
          fullWidth
        />
      </div>
    </FullColumn>
  );
}
