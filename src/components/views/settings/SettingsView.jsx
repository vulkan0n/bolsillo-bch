import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";

import {
  selectActiveWalletHash,
  selectIsExpertMode,
  selectPreferences,
  setPreference,
} from "@/redux/preferences";

import { googleSignOut } from "@/kernel/backup/CloudBackupService";
import NotificationService from "@/kernel/app/NotificationService";

import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import KeyWarning from "@/atoms/KeyWarning/KeyWarning";
import SeleneLogo from "@/atoms/SeleneLogo";
import Accordion from "@/atoms/Accordion";

import { SELENE_WALLET_VERSION } from "@/util/version";

import { translate } from "@/util/translations";
import translations from "./translations";

import CurrencySettings from "./CurrencySettings";
import IntlSettings from "./IntlSettings";
import NetworkSettings from "./NetworkSettings";
import PaymentSettings from "./PaymentSettings";
import PrivacySettings from "./PrivacySettings";
import QrCodeSettings from "./QrCodeSettings";
import SecuritySettings from "./SecuritySettings";
import { SettingsContext } from "./SettingsContext";
import UiSettings from "./UiSettings";
import WalletSettings from "./WalletSettings";

const VERSION_TAP_THRESHOLD = 7;

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const isExpertMode = useSelector(selectIsExpertMode);

  const [versionTapCount, setVersionTapCount] = useState(0);

  // Reset tap counter after 3s of inactivity
  useEffect(() => {
    if (versionTapCount === 0) return;
    const timer = setTimeout(() => setVersionTapCount(0), 3000);
    return () => clearTimeout(timer);
  }, [versionTapCount]);

  const handleVersionTap = useCallback(() => {
    const newCount = versionTapCount + 1;
    setVersionTapCount(newCount);
    if (newCount >= VERSION_TAP_THRESHOLD) {
      dispatch(setPreference({ key: "expertMode", value: "true" }));
      setVersionTapCount(0);
      NotificationService().success(
        translate(translations.modoAvanzadoActivado)
      );
    }
  }, [versionTapCount, dispatch]);

  const handleSettingsUpdate = useCallback(
    (key, value) => {
      dispatch(setPreference({ key, value }));
    },
    [dispatch]
  );

  const settingsContext = {
    handleSettingsUpdate,
    preferences,
    dispatch,
  };

  const activeWalletHash = useSelector(selectActiveWalletHash);

  const handleLogout = useCallback(async () => {
    try {
      await googleSignOut();
    } catch (_e) {
      // not signed in or web env — continue
    }
    dispatch(setPreference({ key: "activeWalletHash", value: "" }));
    window.location.reload();
  }, [dispatch]);

  return (
    <FullColumn>
      <ViewHeader
        icon={SettingOutlined}
        title={translate(translations.settings)}
      />
      <div data-testid="settings-view" className="p-1">
        <SettingsContext.Provider value={settingsContext}>
          <KeyWarning walletHash={activeWalletHash} />

          {/*
           * Default sections (4) — always visible
           */}
          <SecuritySettings />
          <CurrencySettings />
          <PaymentSettings />
          <IntlSettings />

          {/*
           * ⚙️ Avanzado section — only visible in expert mode
           */}
          {isExpertMode && (
            <Accordion
              icon={SettingOutlined}
              title={translate(translations.avanzado)}
            >
              <NetworkSettings />
              <QrCodeSettings />
              <UiSettings />
              <PrivacySettings />
              <WalletSettings />
            </Accordion>
          )}
        </SettingsContext.Provider>
      </div>
      <div className="flex flex-col gap-2 p-1 pb-4 mx-1">
        <Button
          onClick={handleLogout}
          label={
            <span className="font-semibold">
              {translate(translations.signOut)}
            </span>
          }
          icon={LogoutOutlined}
          padding="1"
          fullWidth
        />
        <span
          onClick={handleVersionTap}
          className="w-full text-center text-sm text-neutral-400 dark:text-neutral-600 cursor-default select-none py-2"
        >
          Bolsillo BCH v{SELENE_WALLET_VERSION}
        </span>
      </div>
    </FullColumn>
  );
}
