import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
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
  ApiOutlined,
  CloudServerOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import {
  selectPreferences,
  setPreference,
  selectCurrencySettings,
  selectDenomination,
  selectInstantPaySettings,
  selectActiveWalletId,
} from "@/redux/preferences";
import { syncReconnect } from "@/redux/sync";

import WalletService from "@/services/WalletService";
import { currencyList } from "@/util/currency";
import { languageList, translate } from "@/util/translations";

import Button from "@/components/atoms/Button";
import { satsToDisplayAmount } from "@/util/sats";

import CurrencySymbol from "@/components/atoms/CurrencySymbol";

import ViewHeader from "./ViewHeader";
import KeyWarning from "./settingsView/KeyWarning/KeyWarning";
import SettingsCategory from "./settingsView/SettingsCategory";

import SatoshiInput from "@/components/atoms/SatoshiInput";

import { logos } from "@/util/logos";
import SELENE_WALLET_VERSION from "@/util/version";

import translations from "./SettingsViewTranslations";
import { electrum_servers } from "@/util/electrum_servers";

const SettingsContext = createContext({});

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

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

  return (
    <>
      <ViewHeader
        icon={SettingOutlined}
        title={translate(translations.settings)}
      />
      <div className="p-1">
        <SettingsContext.Provider value={settingsContext}>
          <KeyWarning />
          <WalletSettings />
          <CurrencySettings />
          <PaymentSettings />
          <QrCodeSettings />
          <IntlSettings />
          <NetworkSettings />
        </SettingsContext.Provider>
      </div>
      <div className="w-fit mx-auto px-2 py-0.5 shadow-sm rounded-full bg-primary text-white active:bg-white active:text-primary">
        <Link
          to="/credits"
          className="w-fit mx-auto my-2 flex items-center justify-center"
        >
          <img src={logos.selene.img} className="w-11 h-11 mr-1" alt="" />
          <span className="text-sm font-semibold">
            Selene Wallet v{SELENE_WALLET_VERSION}
          </span>
        </Link>
      </div>
    </>
  );
}

function WalletSettings() {
  const walletList = new WalletService().getWallets();
  const activeWalletId = useSelector(selectActiveWalletId);

  return (
    <SettingsCategory
      icon={WalletOutlined}
      title={translate(translations.walletSettings)}
    >
      <Link to="/settings/wallet/wizard" className="w-full block p-2">
        <PlusCircleFilled className="text-xl mr-1" />
        {translate(translations.createImportWallet)}
      </Link>
      {walletList.map((w) => (
        <Link
          key={w.id}
          to={`/settings/wallet/${w.id}`}
          className="w-full block p-2"
        >
          {w.id.toString() === activeWalletId && (
            <CheckCircleOutlined className="text-xl mr-1 text-secondary" />
          )}
          {w.name}
        </Link>
      ))}
    </SettingsCategory>
  );
}

function CurrencySettings() {
  const { handleSettingsUpdate } = useContext(SettingsContext);

  const {
    localCurrency,
    shouldPreferLocalCurrency,
    shouldHideBalance,
    shouldDisplayExchangeRate,
  } = useSelector(selectCurrencySettings);

  const shouldDenominateSats = useSelector(selectDenomination) === "sats";

  return (
    <SettingsCategory
      icon={DollarCircleOutlined}
      title={translate(translations.currencySettings)}
    >
      <SettingsCategory.Child
        icon={EuroCircleOutlined}
        label={translate(translations.localCurrency)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-24"
          value={localCurrency || ""}
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
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={TransactionOutlined}
        label={translate(translations.preferLocalCurrency)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldPreferLocalCurrency}
          onChange={(event) =>
            handleSettingsUpdate("preferLocalCurrency", event.target.checked)
          }
        />
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined}
        label={translate(translations.hideAvailableBalance)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldHideBalance}
          onChange={(event) =>
            handleSettingsUpdate("hideAvailableBalance", event.target.checked)
          }
        />
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={AccountBookOutlined}
        label={translate(translations.denominateInSats)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldDenominateSats}
          onChange={(event) =>
            handleSettingsUpdate("denominateSats", event.target.checked)
          }
        />
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={StockOutlined}
        label={translate(translations.displayExchangeRate)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={shouldDisplayExchangeRate}
          onChange={(event) =>
            handleSettingsUpdate("displayExchangeRate", event.target.checked)
          }
        />
      </SettingsCategory.Child>
    </SettingsCategory>
  );
}

function PaymentSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);
  const { instantPayThreshold } = useSelector(selectInstantPaySettings);

  const [instantPaySatInput, setInstantPaySatInput] = useState({
    display: satsToDisplayAmount(instantPayThreshold),
    sats: instantPayThreshold,
  });

  const handleInstantPayInput = (satInput) => {
    setInstantPaySatInput(satInput);
    handleSettingsUpdate("instantPayThreshold", satInput.sats);
  };

  return (
    <SettingsCategory
      icon={SendOutlined}
      title={translate(translations.paymentSettings)}
    >
      <SettingsCategory.Child
        icon={ThunderboltOutlined}
        label={translate(translations.allowInstantPay)}
      >
        <input
          type="checkbox"
          className="toggle"
          checked={preferences.allowInstantPay === "true"}
          onChange={(event) =>
            handleSettingsUpdate("allowInstantPay", event.target.checked)
          }
        />
      </SettingsCategory.Child>
      <SettingsCategory.Child>
        <span className="text-zinc-600">
          {translate(translations.instantPayExplanation)}
        </span>
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={PropertySafetyOutlined}
        label={translate(translations.instantPayLimit)}
      >
        <span className="text-zinc-600">
          <CurrencySymbol className="font-bold" />
          <SatoshiInput
            satoshiInput={instantPaySatInput}
            className="p-2 w-28 rounded mx-1"
            onChange={handleInstantPayInput}
          />
        </span>
      </SettingsCategory.Child>
    </SettingsCategory>
  );
}

function QrCodeSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);

  const logoKey = preferences.qrCodeLogo.toLowerCase();

  const handleResetQrColors = () => {
    handleSettingsUpdate("qrCodeLogo", "selene");
    handleSettingsUpdate("qrCodeForeground", "#000000");
    handleSettingsUpdate("qrCodeBackground", "#ffffff");
  };

  return (
    <SettingsCategory
      icon={QrcodeOutlined}
      title={translate(translations.qrCodeSettings)}
    >
      <SettingsCategory.Child
        icon={BorderOuterOutlined}
        label={translate(translations.logo)}
      >
        <div className="flex items-center">
          {logoKey !== "none" && (
            <img src={logos[logoKey].img} className="w-8 h-8 mx-2" alt="" />
          )}
          <select
            className="rounded h-10 w-24 p-2 flex-1 bg-white"
            value={preferences.qrCodeLogo || ""}
            onChange={(event) =>
              handleSettingsUpdate("qrCodeLogo", event.target.value)
            }
          >
            {Object.keys(logos).map((l) => (
              <option key={l}>{logos[l].name}</option>
            ))}
          </select>
        </div>
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={FormatPainterOutlined}
        label={translate(translations.foregroundColor)}
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
      </SettingsCategory.Child>
      <SettingsCategory.Child
        icon={BgColorsOutlined}
        label={translate(translations.backgroundColor)}
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
      </SettingsCategory.Child>
      <SettingsCategory.Child icon={null} label="">
        <div className="flex items-center">
          <Button
            onClick={handleResetQrColors}
            icon={() => (
              <span>
                <UndoOutlined className="mr-1" />
                {translate(translations.resetColors)}
              </span>
            )}
          />
        </div>
      </SettingsCategory.Child>
    </SettingsCategory>
  );
}

function IntlSettings() {
  const { handleSettingsUpdate, preferences } = useContext(SettingsContext);
  return (
    <SettingsCategory
      icon={GlobalOutlined}
      title={translate(translations.localizationSettings)}
    >
      <SettingsCategory.Child
        icon={FlagOutlined}
        label={translate(translations.language)}
      >
        <select
          className="p-2 bg-white rounded h-10 w-1/2"
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
      </SettingsCategory.Child>
    </SettingsCategory>
  );
}

function NetworkSettings() {
  const { handleSettingsUpdate, preferences, dispatch } =
    useContext(SettingsContext);

  const [shouldShowElectrumServerInput, setShouldShowElectrumServerInput] =
    useState(false);
  const [electrumServerInput, setElectrumServerInput] = useState("");

  const handleElectrumServerChoice = (server) => {
    handleSettingsUpdate("electrumServer", server);
    dispatch(syncReconnect(server));
  };

  const handleAddElectrumServer = () => {
    electrum_servers.unshift(electrumServerInput);
    setShouldShowElectrumServerInput(false);
    setElectrumServerInput("");
    handleElectrumServerChoice(electrum_servers[0]);
  };

  return (
    <SettingsCategory
      icon={ApiOutlined}
      title={translate(translations.network)}
    >
      <SettingsCategory.Child
        icon={CloudServerOutlined}
        label={translate(translations.translatedElectrumServer)}
      >
        <select
          className="p-2 bg-white rounded h-10"
          value={preferences.electrumServer || ""}
          onChange={(event) => {
            handleElectrumServerChoice(event.target.value);
          }}
        >
          {electrum_servers.map((server) => (
            <option key={server} value={server}>
              {server}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShouldShowElectrumServerInput(true)}
        >
          <PlusCircleFilled className="ml-2 text-2xl" />
        </button>
      </SettingsCategory.Child>
      {shouldShowElectrumServerInput && (
        <SettingsCategory.Child
          icon={ApiOutlined}
          label={translate(translations.customServer)}
        >
          <form onSubmit={handleAddElectrumServer}>
            <input
              type="text"
              value={electrumServerInput}
              onChange={(event) => {
                setElectrumServerInput(event.target.value);
              }}
            />
            <button type="submit">
              <PlusCircleFilled className="ml-2 text-2xl" />
            </button>
          </form>
        </SettingsCategory.Child>
      )}
    </SettingsCategory>
  );
}
