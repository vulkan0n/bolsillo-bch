import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import WalletService from "@/services/WalletService";
import { currencyList } from "@/util/currency";
import { satsToDisplayAmount } from "@/util/sats";

import Button from "@/components/atoms/Button";
import CurrencySymbol from "@/components/atoms/CurrencySymbol";

import {
  SettingOutlined,
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
  BgColorsOutlined,
  SettingFilled,
  FormatPainterOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import ViewHeader from "./ViewHeader";
import KeyWarning from "./settingsView/KeyWarning";
import SettingsCategory from "./settingsView/SettingsCategory";
import SettingsChild from "./settingsView/SettingsChild";

import SatoshiInput from "@/components/atoms/SatoshiInput";

import { logos } from "@/util/logos";
import SELENE_WALLET_VERSION from "@/util/version";

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const wallet = useSelector(selectActiveWallet);

  function handleSettingsUpdate(key, value) {
    dispatch(setPreference({ key, value }));
  }

  const walletList = new WalletService().getWallets();
  const logoKey = preferences["qrCodeLogo"].toLowerCase();

  const handleResetQrColors = () => {
    handleSettingsUpdate("qrCodeLogo", "selene");
    handleSettingsUpdate("qrCodeForeground", "#000000");
    handleSettingsUpdate("qrCodeBackground", "#ffffff");
  };
  console.log(JSON.stringify(preferences["instantPayThreshold"]));

  return (
    <>
      <ViewHeader icon={SettingOutlined} title="Settings" />
      <div className="p-1">
        <KeyWarning wallet={wallet} />

        <SettingsCategory icon={WalletOutlined} title="Wallets">
          <Link to="/settings/wallet/wizard" className="w-full block p-2">
            <PlusCircleFilled className="text-xl mr-1" />
            Create/Import Wallet
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

        <SettingsCategory icon={DollarCircleOutlined} title="Currency">
          <SettingsChild icon={EuroCircleOutlined} label="Local Currency">
            <select
              className="p-2 bg-white rounded h-10 w-24"
              value={preferences["localCurrency"] || ""}
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
            label="Prefer Local Currency"
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
            label="Hide Available Balance"
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
          <SettingsChild icon={AccountBookOutlined} label="Denominate in Sats">
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

        <SettingsCategory icon={SendOutlined} title="Instant Pay">
          <SettingsChild icon={ThunderboltOutlined} label="Allow Instant Pay">
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
            label="Instant Pay Limit"
          >
            <span className="text-zinc-600">
              <CurrencySymbol className="font-bold" />
              <SatoshiInput
                satoshiInput={{
                  display: satsToDisplayAmount(
                    preferences["instantPayThreshold"]
                  ),
                  sats: preferences["instantPayThreshold"],
                }}
                className="p-2 w-28 rounded mx-1"
                onChange={(satInput) =>
                  handleSettingsUpdate("instantPayThreshold", satInput.sats)
                }
              />
            </span>
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory icon={QrcodeOutlined} title="QR Code">
          <SettingsChild icon={BorderOuterOutlined} label="Logo">
            <div className="flex items-center">
              {logoKey !== "none" && (
                <img src={logos[logoKey].img} className="w-8 h-8 mx-2" />
              )}
              <select
                className="rounded h-10 w-24 p-2 flex-1 bg-white"
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
          <SettingsChild icon={FormatPainterOutlined} label="Foreground Color">
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences["qrCodeForeground"] }}
              />
              <input
                type="color"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences["qrCodeForeground"] || ""}
                onChange={(event) =>
                  handleSettingsUpdate("qrCodeForeground", event.target.value)
                }
              />
            </div>
          </SettingsChild>
          <SettingsChild icon={BgColorsOutlined} label="Background Color">
            <div className="flex items-center">
              <SettingFilled
                className="text-3xl px-2"
                style={{ color: preferences["qrCodeBackground"] }}
              />
              <input
                type="color"
                className="rounded h-10 w-24 m-0 p-2"
                value={preferences["qrCodeBackground"] || ""}
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
                    Reset Colors
                  </span>
                )}
              />
            </div>
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
      <Link to="/credits">
        <div className="w-fit mx-auto my-2 p-2 flex items-center justify-center shadow-sm rounded-full bg-primary text-white active:bg-white active:text-primary">
          <img src={logos["selene"].img} className="w-11 h-11 mr-1" />
          <span className="text-sm font-semibold">
            Selene Wallet v{SELENE_WALLET_VERSION}
          </span>
        </div>
      </Link>
    </>
  );
}
