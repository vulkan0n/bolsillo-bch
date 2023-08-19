import { useState } from "react";
import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import {
  SettingOutlined,
  GlobalOutlined,
  FlagOutlined,
  WalletOutlined,
  DollarCircleOutlined,
  EuroCircleOutlined,
  TransactionOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  AccountBookOutlined,
  SendOutlined,
  ThunderboltOutlined,
  PropertySafetyOutlined,
  QrcodeOutlined,
  PlusCircleFilled,
  CheckCircleOutlined,
  BorderOuterOutlined,
  StockOutlined,
  BgColorsOutlined,
  SettingFilled,
  FormatPainterOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  selectPreferences,
  setPreference,
  selectInstantPay,
  selectActiveWalletId,
} from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import WalletService from "@/services/WalletService";
import { currencyList } from "@/util/currency";
import { languageList, translate } from "@/util/translations";

import Button from "@/components/atoms/Button";
import { satsToDisplayAmount } from "@/util/sats";

import CurrencySymbol from "@/components/atoms/CurrencySymbol";

import ViewHeader from "./ViewHeader";
import KeyWarning from "./settingsView/KeyWarning/KeyWarning";
import SettingsCategory from "./settingsView/SettingsCategory";
import SettingsChild from "./settingsView/SettingsChild";

import SatoshiInput from "@/components/atoms/SatoshiInput";

import { logos } from "@/util/logos";
import SELENE_WALLET_VERSION from "@/util/version";

import translations from "./SettingsViewTranslations";

const {
  settings,
  walletSettings,
  createImportWallet,
  localizationSettings,
  language,
  currencySettings,
  localCurrency,
  preferLocalCurrency,
  hideAvailableBalance,
  denominateInSats,
  displayExchangeRate,
  paymentSettings,
  allowInstantPay,
  instantPayExplanation,
  instantPayLimit,
  qrCodeSettings,
  logo,
  foregroundColor,
  backgroundColor,
  resetColors,
} = translations;

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);
  const activeWalletId = useSelector(selectActiveWalletId);

  const { instantPayThreshold } = useSelector(selectInstantPay);

  const [instantPaySatInput, setInstantPaySatInput] = useState({
    display: satsToDisplayAmount(instantPayThreshold),
    sats: instantPayThreshold,
  });

  function handleSettingsUpdate(key, value) {
    dispatch(setPreference({ key, value }));
  }

  const walletList = new WalletService().getWallets();
  const logoKey = preferences.qrCodeLogo.toLowerCase();

  const handleResetQrColors = () => {
    handleSettingsUpdate("qrCodeLogo", "selene");
    handleSettingsUpdate("qrCodeForeground", "#000000");
    handleSettingsUpdate("qrCodeBackground", "#ffffff");
  };

  return (
    <>
      <ViewHeader icon={SettingOutlined} title={translate(settings)} />
      <div className="p-1">
        <KeyWarning wallet={wallet} />

        <SettingsCategory
          icon={WalletOutlined}
          title={translate(walletSettings)}
        >
          <Link to="/settings/wallet/wizard" className="w-full block p-2">
            <PlusCircleFilled className="text-xl mr-1" />
            {translate(createImportWallet)}
          </Link>
          {walletList.map((wallet) => (
            <Link
              key={wallet.id}
              to={`/settings/wallet/${wallet.id}`}
              className="w-full block p-2"
            >
              {wallet.id.toString() === activeWalletId && (
                <CheckCircleOutlined className="text-xl mr-1 text-secondary" />
              )}
              {wallet.name}
            </Link>
          ))}
        </SettingsCategory>

        <SettingsCategory
          icon={DollarCircleOutlined}
          title={translate(currencySettings)}
        >
          <SettingsChild
            icon={EuroCircleOutlined}
            label={translate(localCurrency)}
          >
            <select
              className="p-2 bg-white rounded h-10 w-24"
              value={preferences.localCurrency || ""}
              onChange={(event) =>
                handleSettingsUpdate("localCurrency", event.target.value)
              }
            >
              {currencyList
                .filter((c) => c.currency !== "BCH")
                .map((c) => (
                  <option key={c.currency} value={c.currency}>
                    {c.currency} {c.symbol}
                  </option>
                ))}
            </select>
          </SettingsChild>
          <SettingsChild
            icon={TransactionOutlined}
            label={translate(preferLocalCurrency)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences.preferLocalCurrency === "true"}
              onChange={(event) =>
                handleSettingsUpdate(
                  "preferLocalCurrency",
                  event.target.checked
                )
              }
            />
          </SettingsChild>
          <SettingsChild
            icon={
              preferences.hideAvailableBalance === "true"
                ? EyeInvisibleOutlined
                : EyeOutlined
            }
            label={translate(hideAvailableBalance)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences.hideAvailableBalance === "true"}
              onChange={(event) =>
                handleSettingsUpdate(
                  "hideAvailableBalance",
                  event.target.checked
                )
              }
            />
          </SettingsChild>
          <SettingsChild
            icon={AccountBookOutlined}
            label={translate(denominateInSats)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences.denominateSats === "true"}
              onChange={(event) =>
                handleSettingsUpdate("denominateSats", event.target.checked)
              }
            />
          </SettingsChild>
          <SettingsChild
            icon={StockOutlined}
            label={translate(displayExchangeRate)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences.displayExchangeRate === "true"}
              onChange={(event) =>
                handleSettingsUpdate(
                  "displayExchangeRate",
                  event.target.checked
                )
              }
            />
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory
          icon={SendOutlined}
          title={translate(paymentSettings)}
        >
          <SettingsChild
            icon={ThunderboltOutlined}
            label={translate(allowInstantPay)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences.allowInstantPay === "true"}
              onChange={(event) =>
                handleSettingsUpdate("allowInstantPay", event.target.checked)
              }
            />
          </SettingsChild>
          <SettingsChild>
            <span className="text-zinc-600">
              {translate(instantPayExplanation)}
            </span>
          </SettingsChild>
          <SettingsChild
            icon={PropertySafetyOutlined}
            label={translate(instantPayLimit)}
          >
            <span className="text-zinc-600">
              <CurrencySymbol className="font-bold" />
              <SatoshiInput
                satoshiInput={instantPaySatInput}
                className="p-2 w-28 rounded mx-1"
                onChange={(satInput) => {
                  setInstantPaySatInput(satInput);
                  handleSettingsUpdate("instantPayThreshold", satInput.sats);
                }}
              />
            </span>
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory
          icon={QrcodeOutlined}
          title={translate(qrCodeSettings)}
        >
          <SettingsChild icon={BorderOuterOutlined} label={translate(logo)}>
            <div className="flex items-center">
              {logoKey !== "none" && (
                <img src={logos[logoKey].img} className="w-8 h-8 mx-2" />
              )}
              <select
                className="rounded h-10 w-24 p-2 flex-1 bg-white"
                value={preferences.qrCodeLogo || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeLogo", event.target.value)
                }
              >
                {Object.keys(logos).map((logo) => (
                  <option key={logo}>{logos[logo].name}</option>
                ))}
              </select>
            </div>
          </SettingsChild>
          <SettingsChild
            icon={FormatPainterOutlined}
            label={translate(foregroundColor)}
          >
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences.qrCodeForeground }}
              />
              <input
                type="color"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences.qrCodeForeground || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeForeground", event.target.value)
                }
              />
            </div>
          </SettingsChild>
          <SettingsChild
            icon={BgColorsOutlined}
            label={translate(backgroundColor)}
          >
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences.qrCodeBackground }}
              />
              <input
                type="color"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences.qrCodeBackground || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeBackground", event.target.value)
                }
              />
            </div>
          </SettingsChild>
          <SettingsChild icon={() => null} label="">
            <div className="flex items-center">
              <Button
                onClick={handleResetQrColors}
                icon={() => (
                  <span>
                    <UndoOutlined className="mr-1" />
                    {translate(resetColors)}
                  </span>
                )}
              />
            </div>
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory
          icon={GlobalOutlined}
          title={translate(localizationSettings)}
        >
          <SettingsChild icon={FlagOutlined} label={translate(language)}>
            <select
              className="select"
              value={preferences.languageCode || ""}
              onChange={(event) => {
                handleSettingsUpdate("languageCode", event.target.value);
              }}
            >
              {languageList.map(({ flag, code, name }) => (
                <option key={code} value={code}>
                  {flag} {code.toUpperCase()} - {name}
                </option>
              ))}
            </select>
          </SettingsChild>
        </SettingsCategory>

        {/*
        <SettingsCategory icon={BarChartOutlined} title="Analytics Settings">
          <SettingsChild icon={DashboardOutlined} label="Enable Analytics">
            <input
              type="checkbox"
              className="toggle"
              onChange={(event) => null}
            />
          </SettingsChild>
        </SettingsCategory>
        */}
      </div>
      <Link to="/credits" className="w-fit mx-auto my-2">
        <div className="w-fit mx-auto p-2 flex items-center justify-center shadow-sm rounded-full bg-primary text-white active:bg-white active:text-primary">
          <img src={logos.selene.img} className="w-11 h-11 mr-1" />
          <span className="text-sm font-semibold">
            Selene Wallet v{SELENE_WALLET_VERSION}
          </span>
        </div>
      </Link>
    </>
  );
}
