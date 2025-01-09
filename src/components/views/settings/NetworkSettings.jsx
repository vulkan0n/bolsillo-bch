import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import {
  PlusCircleFilled,
  ApiOutlined,
  CloudServerOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";

import {
  syncReconnect,
  syncDisconnect,
  selectElectrumServer,
} from "@/redux/sync";
import { selectBchNetwork, selectIsOfflineMode } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";

import {
  electrum_servers,
  ElectrumServer,
  DEFAULT_ELECTRUM_PORT,
} from "@/util/electrum_servers";

import { SettingsContext } from "./SettingsContext";

import Accordion from "@/atoms/Accordion";

export default function NetworkSettings() {
  const { handleSettingsUpdate, preferences, dispatch } =
    useContext(SettingsContext);

  const [shouldShowElectrumServerInput, setShouldShowElectrumServerInput] =
    useState(false);
  const [electrumServerInput, setElectrumServerInput] = useState("");

  const bchNetwork = useSelector(selectBchNetwork);
  const isOfflineMode = useSelector(selectIsOfflineMode);

  const handleElectrumServerChoice = (server) => {
    handleSettingsUpdate("electrumServer", server);
    dispatch(syncReconnect(server));
  };

  const handleAddElectrumServer = () => {
    electrum_servers[bchNetwork].unshift(
      new ElectrumServer(electrumServerInput).toString()
    );
    setShouldShowElectrumServerInput(false);
    setElectrumServerInput("");
    handleElectrumServerChoice(electrum_servers[bchNetwork][0]);
  };

  const handleSetOfflineMode = async (event) => {
    const { checked } = event.target;

    handleSettingsUpdate("offlineMode", checked);

    if (checked) {
      dispatch(syncDisconnect());
    } else {
      setTimeout(() => {
        dispatch(syncReconnect());
      }, 100);
    }
  };

  const electrumServer = useSelector(selectElectrumServer);
  const currentServer =
    bchNetwork !== "mainnet" || electrumServer !== preferences.electrumServer
      ? electrumServer
      : preferences.electrumServer;

  return (
    <Accordion icon={ApiOutlined} title={translate(translations.network)}>
      <Accordion.Child
        icon={CloudServerOutlined}
        label={translate(translations.translatedElectrumServer)}
      >
        <div className="flex items-center">
          <select
            className="p-2 bg-white rounded h-10 w-40 flex-1 disabled:bg-zinc-200 disabled:text-zinc-400"
            value={currentServer}
            disabled={isOfflineMode === true}
            onChange={(event) => {
              handleElectrumServerChoice(event.target.value);
            }}
          >
            {electrum_servers[bchNetwork].map((server) => {
              const parts = ElectrumServer.toParts(server);
              return (
                <option key={server} value={server}>
                  {parts.port !== DEFAULT_ELECTRUM_PORT ? server : parts.host}
                </option>
              );
            })}
          </select>
          {!isOfflineMode && (
            <button
              type="button"
              onClick={() => setShouldShowElectrumServerInput(true)}
            >
              <PlusCircleFilled className="ml-2 text-2xl" />
            </button>
          )}
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

      <Accordion.Child
        icon={DisconnectOutlined}
        label={translate(translations.offlineMode)}
      >
        <input
          type="checkbox"
          checked={isOfflineMode}
          onChange={handleSetOfflineMode}
        />
      </Accordion.Child>
    </Accordion>
  );
}
