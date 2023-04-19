import { useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { bchToSats, satsToBch, DUST_LIMIT } from "@/util/sats";
import WalletService from "@/services/WalletService";

import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";

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
  QrcodeOutlined,
} from "@ant-design/icons";

import ViewHeader from "./ViewHeader";
import KeyWarning from "./settingsView/KeyWarning";
import SettingsCategory from "./settingsView/SettingsCategory";
import SettingsChild from "./settingsView/SettingsChild";

export default function SettingsView() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

  function handleSettingsUpdate(key, value) {
    dispatch(setPreference({ key, value }));
  }

  const walletList = new WalletService().getWallets();

  return (
    <>
      <ViewHeader icon={SettingOutlined} title="Settings" />
      <div className="p-1">
        <KeyWarning />

        <SettingsCategory icon={WalletOutlined} title="Wallet Settings">
          {walletList.map((wallet) => (
            <Link
              key={wallet.id}
              to={`/settings/wallet/${wallet.id}`}
              className="w-full block p-2"
            >
              {wallet.name}
            </Link>
          ))}
        </SettingsCategory>

        <SettingsCategory icon={DollarCircleOutlined} title="Currency Settings">
          <SettingsChild icon={EuroCircleOutlined} label="Local Currency">
            <select
              className="select"
              value={preferences["localCurrency"] || ""}
              onChange={(event) =>
                handleSettingsUpdate("localCurrency", event.target.value)
              }
            >
              <option>USD</option>
              <option>EUR</option>
              <option>CNY</option>
              <option>JPY</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>AUD</option>
              <option>BTC</option>
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

        <SettingsCategory icon={SendOutlined} title="Payment Settings">
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
            label="Instant Pay Threshold"
          >
            {preferences["denominateSats"] === "true" ? (
              <input
                type="number"
                placeholder="25000000"
                min="0"
                step="1000"
                className="input"
                value={preferences["instantPayThreshold"] || "0"}
                onChange={(event) =>
                  handleSettingsUpdate(
                    "instantPayThreshold",
                    event.target.value
                  )
                }
              />
            ) : (
              <input
                type="number"
                placeholder="0.25000000"
                min="0"
                step="0.00001000"
                className="input"
                value={satsToBch(preferences["instantPayThreshold"] || 0)}
                onChange={(event) => {
                  const satoshis = bchToSats(
                    event.target.value || satsToBch(DUST_LIMIT)
                  );
                  handleSettingsUpdate("instantPayThreshold", satoshis);
                }}
              />
            )}
          </SettingsChild>
        </SettingsCategory>

        <SettingsCategory icon={QrcodeOutlined} title="QR Code Settings">
          <SettingsChild title="Logo">
            <select
              className="select"
              value={preferences["qrCodeLogo"] || ""}
              onChange={(event) =>
                handleSettingsUpdate("qrCodeLogo", event.target.value)
              }
            >
              <option>Selene</option>
              <option>BCH</option>
              <option>None</option>
            </select>
          </SettingsChild>
          <SettingsChild title="Background Color">
            <input
              type="text"
              className="input"
              value={preferences["qrCodeBackground"] || ""}
              onChange={(event) =>
                handleSettingsUpdate("qrCodeBackground", event.target.value)
              }
            />
          </SettingsChild>
          <SettingsChild title="Foreground Color">
            <input
              type="text"
              className="input"
              value={preferences["qrCodeForeground"] || ""}
              onChange={(event) =>
                handleSettingsUpdate("qrCodeForeground", event.target.value)
              }
            />
          </SettingsChild>
        </SettingsCategory>
      </div>
    </>
  );
}
