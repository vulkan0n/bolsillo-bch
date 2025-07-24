import { useState, useMemo } from "react";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { CloseOutlined, CopyOutlined } from "@ant-design/icons";
import {
  selectWcSessions,
  wcSessionDelete,
  wcSessionReject,
} from "@/redux/walletConnect";
import { selectActiveWalletHash } from "@/redux/wallet";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";
import { WalletConnectFilled } from "@/icons/WalletConnectFilled";

import { useClipboard } from "@/hooks/useClipboard";

import WalletConnectService from "@/services/WalletConnectService";
import AddressManagerService from "@/services/AddressManagerService";
import LogService from "@/services/LogService";

const Log = LogService("AppWalletConnectView");

export default function AppWalletConnectView() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { handleCopyToClipboard } = useClipboard();

  const [walletConnectUri, setWalletConnectUri] = useState(
    location.state?.wcUri
  );

  const sessions = useSelector(selectWcSessions);

  const WalletConnect = WalletConnectService();

  const handlePair = async (e) => {
    e.preventDefault();

    Log.debug(walletConnectUri);
    await WalletConnect.pair({ uri: walletConnectUri });

    setWalletConnectUri("");
  };

  const handleReject = async () => {
    dispatch(wcSessionReject(sessionId));
  };

  const handleDeleteSession = async (sessionId) => {
    dispatch(wcSessionDelete(sessionId));
  };

  const walletHash = useSelector(selectActiveWalletHash);
  const walletConnectAddress = useMemo(() => {
    const AddressManager = AddressManagerService(walletHash);
    const { address } = AddressManager.getAddressRange(0, 0)[0];

    return address;
  }, [walletHash]);

  const handleCopyWalletConnectAddress = () => {
    handleCopyToClipboard(walletConnectAddress, walletConnectAddress);
  };

  return (
    <FullColumn>
      <ViewHeader title="WalletConnect" icon={WalletConnectFilled} />
      <div className="p-1 bg-primary-900 text-neutral-50">
        <div className="px-1 font-bold flex items-center">
          <WalletConnectFilled className="mr-1" />
          WalletConnect Address
        </div>
        <Button
          icon={CopyOutlined}
          iconSize="md"
          labelColor="text-primary-700"
          label={
            <Address
              address={walletConnectAddress}
              className="font-mono tracking-tighter"
            />
          }
          onClick={handleCopyWalletConnectAddress}
          rounded="md"
          padding="2"
          fullWidth
          className="my-1"
        />
      </div>
      <form onSubmit={handlePair} className="p-2 flex items-center">
        <input
          type="text"
          className="p-1 w-full border-2 rounded-sm border-primary mr-2"
          value={walletConnectUri}
          onChange={(e) => setWalletConnectUri(e.target.value)}
        />
        <Button label="Pair" submit />
      </form>
      <div className="p-1">
        {Object.keys(sessions).map((key) => {
          const session = sessions[key];
          const peer = session.peer.metadata;
          const address = session.namespaces.bch.accounts[0].slice(4);

          return (
            <>
              <div
                className="p-1 border border-neutral-600 rounded-sm"
                key={key}
              >
                <div className="flex">
                  <div className="flex items-center justify-center p-1 border border-neutral-500 w-16 h-16">
                    <img src={peer.icons[0]} className="w-full h-full" />
                  </div>
                  <div className="flex flex-col px-1 w-full">
                    <div className="font-bold">{peer.name}</div>
                    <div className="font-mono text-sm">{peer.url}</div>
                    <div>{peer.description}</div>
                  </div>
                  <div className="shrink mr-1 flex items-center justify-center">
                    <Button
                      icon={CloseOutlined}
                      iconSize="xl"
                      padding="2"
                      onClick={() => handleDeleteSession(key)}
                    />
                  </div>
                </div>
                <div className="font-mono text-sm tracking-tighter">
                  <Address address={address} />
                </div>
              </div>
            </>
          );
        })}
      </div>
    </FullColumn>
  );
}
