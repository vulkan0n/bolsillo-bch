import { useState, useContext } from "react";
import {
  PlusCircleFilled,
  ApiOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";

import { syncReconnect } from "@/redux/sync";

import { translate } from "@/util/translations";
import translations from "./SettingsViewTranslations";

import { electrum_servers } from "@/util/electrum_servers";

import { SettingsContext } from "./SettingsContext";

import Accordion from "@/atoms/Accordion";

export default function NetworkSettings() {
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
    <Accordion icon={ApiOutlined} title={translate(translations.network)}>
      <Accordion.Child
        icon={CloudServerOutlined}
        label={translate(translations.translatedElectrumServer)}
      >
        <div className="flex">
          <select
            className="p-2 bg-white rounded h-10 w-40"
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
        </div>
      </Accordion.Child>
      {shouldShowElectrumServerInput && (
        <Accordion.Child
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
        </Accordion.Child>
      )}
    </Accordion>
  );
}
