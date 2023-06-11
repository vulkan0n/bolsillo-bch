import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import WalletService from "@/services/WalletService";
import { currencyList } from "@/util/currency";
import { languageList } from "@/util/translations";

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
  CameraOutlined,
  QrcodeOutlined,
  PlusCircleFilled,
  CheckCircleOutlined,
  BorderOuterOutlined,
} from "@ant-design/icons";

import ViewHeader from "./ViewHeader";
import KeyWarning from "./settingsView/KeyWarning";
import SettingsCategory from "./settingsView/SettingsCategory";
import SettingsChild from "./settingsView/SettingsChild";

import SatoshiInput from "@/components/atoms/SatoshiInput";

import { logos } from "@/util/logos";
import SELENE_WALLET_VERSION from "@/util/version";

import { translate, translations } from "@/util/translations";

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
  paymentSettings,
  allowInstantPay,
  instantPayLimit,
  enableFastScan,
  qrCodeSettings,
  logo,
} = translations.views.SettingsView;

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const preferencesLanguageCode = preferences["languageCode"];
  const wallet = useSelector(selectActiveWallet);

  function handleSettingsUpdate(key, value) {
    dispatch(setPreference({ key, value }));
  }

  const walletList = new WalletService().getWallets();
  const logoKey = preferences["qrCodeLogo"].toLowerCase();

  return (
    <>
      <ViewHeader
        icon={SettingOutlined}
        title={translate(settings, preferencesLanguageCode)}
      />
      <div className="p-1">
        <KeyWarning wallet={wallet} />

        <SettingsCategory
          icon={WalletOutlined}
          title={translate(walletSettings, preferencesLanguageCode)}
        >
          <Link to="/settings/wallet/wizard" className="w-full block p-2">
            <PlusCircleFilled className="text-xl mr-1" />
            {translate(createImportWallet, preferencesLanguageCode)}
          </Link>
          {walletList.map((wallet) => (
            <Link
              key={wallet.id}
              to={`/settings/wallet/${wallet.id}`}
              className="w-full block p-2"
            >
              {wallet.id.toString() === preferences["activeWalletId"] && (
                <CheckCircleOutlined className="text-xl mr-1 text-secondary" />
              )}
              {wallet.name}
            </Link>
          ))}
        </SettingsCategory>

        <SettingsCategory
          icon={GlobalOutlined}
          title={translate(localizationSettings, preferencesLanguageCode)}
        >
          <SettingsChild
            icon={FlagOutlined}
            label={translate(language, preferencesLanguageCode)}
          >
            <select
              className="select"
              value={preferences["languageCode"] || ""}
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

        <SettingsCategory
          icon={DollarCircleOutlined}
          title={translate(currencySettings, preferencesLanguageCode)}
        >
          <SettingsChild
            icon={EuroCircleOutlined}
            label={translate(localCurrency, preferencesLanguageCode)}
          >
            <select
              className="select"
              value={preferences["localCurrency"] || ""}
              onChange={(event) =>
                handleSettingsUpdate("localCurrency", event.target.value)
              }
            >
              {currencyList.map((currency) => (
                <option key={currency.currency}>{currency.currency}</option>
              ))}
            </select>
          </SettingsChild>
          <SettingsChild
            icon={TransactionOutlined}
            label={translate(preferLocalCurrency, preferencesLanguageCode)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences["preferLocalCurrency"] === "true"}
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
              preferences["hideAvailableBalance"] === "true"
                ? EyeInvisibleOutlined
                : EyeOutlined
            }
            label={translate(hideAvailableBalance, preferencesLanguageCode)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences["hideAvailableBalance"] === "true"}
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
            label={translate(denominateInSats, preferencesLanguageCode)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences["denominateSats"] === "true"}
              onChange={(event) =>
                handleSettingsUpdate("denominateSats", event.target.checked)
              }
            />
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory
          icon={SendOutlined}
          title={translate(paymentSettings, preferencesLanguageCode)}
        >
          <SettingsChild
            icon={ThunderboltOutlined}
            label={translate(allowInstantPay, preferencesLanguageCode)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences["allowInstantPay"] === "true"}
              onChange={(event) =>
                handleSettingsUpdate("allowInstantPay", event.target.checked)
              }
            />
          </SettingsChild>
          <SettingsChild
            icon={PropertySafetyOutlined}
            label={translate(instantPayLimit, preferencesLanguageCode)}
          >
            <span className="text-zinc-600">
              <SatoshiInput
                sats={preferences["instantPayThreshold"]}
                className="p-2 w-28 rounded mx-1"
                onChange={(satoshis) =>
                  handleSettingsUpdate("instantPayThreshold", satoshis)
                }
                allowFiat
              />
            </span>
          </SettingsChild>
          <SettingsChild
            icon={CameraOutlined}
            label={translate(enableFastScan, preferencesLanguageCode)}
          >
            <input
              type="checkbox"
              className="toggle"
              checked={preferences["scannerFastMode"] === "true"}
              onChange={(event) =>
                handleSettingsUpdate("scannerFastMode", event.target.checked)
              }
            />
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory
          icon={QrcodeOutlined}
          title={translate(qrCodeSettings, preferencesLanguageCode)}
        >
          <SettingsChild
            icon={BorderOuterOutlined}
            label={translate(logo, preferencesLanguageCode)}
          >
            <div className="flex items-center">
              {logoKey !== "none" && (
                <img src={logos[logoKey].img} className="w-8 h-8 mx-2" />
              )}
              <select
                className="rounded h-10 w-24 p-2 flex-1"
                value={preferences["qrCodeLogo"] || ""}
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
          {/*<SettingsChild icon={BgColorsOutlined} label="Background Color">
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences["qrCodeBackground"] }}
              />
              <input
                type="text"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences["qrCodeBackground"] || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeBackground", event.target.value)
                }
              />
            </div>
          </SettingsChild>
          <SettingsChild icon={FormatPainterOutlined} label="Foreground Color">
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences["qrCodeForeground"] }}
              />
              <input
                type="text"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences["qrCodeForeground"] || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeForeground", event.target.value)
                }
              />
            </div>
          </SettingsChild>*/}
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

        <SettingsCategory icon={HeartOutlined} title="Donation Settings">
          <SettingsChild icon={GiftOutlined} label="Enable Donation Mode">
            <input
              type="checkbox"
              className="toggle"
              onChange={(event) => null}
            />
          </SettingsChild>
          <SettingsChild
            icon={CodeOutlined}
            label="Donate to Selene Developers"
          >
            <input
              type="checkbox"
              className="toggle"
              onChange={(event) => null}
            />
          </SettingsChild>
          <SettingsChild
            icon={CloudServerOutlined}
            label="Donate to Electrum Server Operator"
          >
            <input
              type="checkbox"
              className="toggle"
              onChange={(event) => null}
            />
          </SettingsChild>
        </SettingsCategory>
        */}
      </div>
      <div className="text-xs text-center text-zinc-500 opacity-80">
        Selene Wallet v{SELENE_WALLET_VERSION}
      </div>
    </>
  );
}
