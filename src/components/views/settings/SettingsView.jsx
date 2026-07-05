import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InfoCircleOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";

import {
  selectActiveWalletHash,
  selectIsExpertMode,
  selectPreferences,
  setPreference,
} from "@/redux/preferences";

import { googleSignOut } from "@/kernel/backup/CloudBackupService";
import ModalService from "@/kernel/app/ModalService";
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

  const infoModalContent = useMemo(
    () => (
      <div className="text-left space-y-3 text-sm leading-relaxed">
        <p>
          <strong>Bolsillo BCH</strong> es una versión simplificada de Selene
          Wallet, adaptada para quienes recién empiezan con Bitcoin Cash.
        </p>
        <p>
          Está pensada para recibir y enviar BCH de forma sencilla, sin
          opciones técnicas complejas.
        </p>
        <p>
          Si te interesó BCH y querés explorar una wallet más completa con
          todas las funcionalidades, te recomendamos{" "}
          <a
            href="https://play.google.com/store/apps/details?id=cash.selene.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Selene Wallet
          </a>
          , la wallet original en la que se basa esta app.
        </p>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs">
          Nota: Bolsillo BCH guarda las claves privadas cifradas en Google
          Drive para facilitar la recuperación. Esto va en contra de la
          filosofía de autocustodia total de BCH — si priorizás la seguridad
          absoluta, usá Selene Wallet u otra wallet de autocustodia.
        </p>
      </div>
    ),
    []
  );

  const handleInfoClick = useCallback(async () => {
    await ModalService().showConfirm({
      title: "Acerca de Bolsillo BCH",
      message: infoModalContent,
      confirmLabel: "Cerrar",
      showCancel: false,
    });
  }, [infoModalContent]);

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
           * Default sections — reordered: Moneda, Personalizar, Seguridad, Pagos
           * Moneda y Personalizar están locked (siempre abiertos)
           */}
          <CurrencySettings />
          <IntlSettings />
          <PaymentSettings />
          <SecuritySettings />

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
              <div className="flex justify-center p-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      setPreference({ key: "expertMode", value: "false" })
                    );
                  }}
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
                >
                  {translate(translations.disableExpertMode)}
                </button>
              </div>
            </Accordion>
          )}
        </SettingsContext.Provider>
      </div>
      <div className="flex flex-col gap-2 p-1 pb-4 mx-1">
        <Button
          onClick={handleInfoClick}
          label={
            <span className="font-semibold">
              Información
            </span>
          }
          icon={InfoCircleOutlined}
          padding="1"
          inverted
          fullWidth
        />
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
