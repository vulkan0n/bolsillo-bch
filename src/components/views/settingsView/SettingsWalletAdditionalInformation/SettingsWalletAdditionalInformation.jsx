import { useState } from "react";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectActiveWalletId } from "@/redux/preferences";
import { useParams, Navigate } from "react-router-dom";

import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  encodeHdPrivateKey,
  deriveHdPublicNode,
  encodeHdPublicKey,
} from "@bitauth/libauth";
import WalletService from "@/services/WalletService";

import ViewHeader from "@/components/views/ViewHeader";
import { translate } from "@/util/translations";
import translations from "./translations";
import { SELENE_DEFAULT_DERIVATION_PATH } from "@/util/crypto";
import SettingsChild from "../SettingsChild";

const {
  additionalWalletInformation,
  activateToReveal,
  derivationPathTitle,
  derivationPathExplanation,
  xPubDescription1,
  xPubDescription2,
  xPubDescription3,
  hideXPub,
  revealXPub,
  xPrvDescription1,
  xPrvDescription2,
  xPrvDescription3,
  hideXPrv,
  revealXPrv,
} = translations;

export default function SettingsWalletAdditionalInformation() {
  const { wallet_id } = useParams();
  const activeWalletId = useSelector(selectActiveWalletId);
  const isActiveWallet = wallet_id === activeWalletId;

  const [isShowXPub, setIsShowXPub] = useState(false);
  const [isShowxPrv, setIsShowxPrv] = useState(false);

  const WalletManager = new WalletService();
  const wallet = WalletManager.getWalletById(wallet_id);

  // if invalid wallet_id passed via queryparams, redirect back to settings
  if (wallet === null) {
    return <Navigate to="/settings" />;
  }

  const derivationPath = `${wallet?.derivation}`;

  const seed = bip39.mnemonicToSeedSync(wallet.mnemonic);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);
  const xPrv = encodeHdPrivateKey({ node: hdMaster, network: "mainnet" });

  const hdMasterPublic = deriveHdPublicNode(hdMaster);
  const xPub = encodeHdPublicKey({ node: hdMasterPublic, network: "mainnet" });

  return (
    <>
      <ViewHeader
        icon={InfoCircleOutlined}
        title={translate(additionalWalletInformation)}
      />
      <SettingsChild icon={null} title={translate(additionalWalletInformation)}>
        {!isActiveWallet && (
          <div className="p-1">
            <p className="text-base">{translate(activateToReveal)}</p>
          </div>
        )}
        {isActiveWallet && (
          <div className="">
            <div className="card flex bg-zinc-100 rounded-md p-3  m-2">
              <div className="card-body">
                <h2 className="card-title">
                  <p className="text-lg mr-2">
                    <b>{translate(derivationPathTitle)}</b>
                  </p>
                </h2>
                <div className="card-actions p-2">
                  <p className="text-lg break-words">
                    <span className="font-mono">{derivationPath}</span>
                  </p>
                  <p className="text-base">
                    {translate(derivationPathExplanation)} "
                    {SELENE_DEFAULT_DERIVATION_PATH}".
                  </p>
                </div>
              </div>
            </div>

            <div className="card flex bg-zinc-100 rounded-md p-3  m-2">
              <div className="card-body">
                <h2 className="card-title">
                  <p className="text-lg mr-2">
                    <b>xPub</b>
                  </p>
                </h2>
                <p className="text-base p-2">
                  {translate(xPubDescription1)}{" "}
                  <b>
                    <u>{translate(xPubDescription2)}</u>
                  </b>{" "}
                  <b>
                    <u>{translate(xPubDescription3)}</u>
                  </b>
                </p>

                <div className="card-title">
                  <div
                    onClick={() => {
                      setIsShowXPub(!isShowXPub);
                    }}
                    className={`rounded-lg p-3 bg-primary text-zinc-50 w-full shadow-sm`}
                  >
                    <div className="flex items-center">
                      {isShowXPub && (
                        <EyeInvisibleOutlined className="text-2xl mr-1" />
                      )}
                      {!isShowXPub && <EyeOutlined className="text-2xl mr-1" />}
                      <div className="text-lg font-medium flex-1 text-center">
                        {isShowXPub
                          ? translate(hideXPub)
                          : translate(revealXPub)}
                      </div>
                    </div>
                  </div>

                  {isShowXPub && (
                    <div className="w-full">
                      <div className="mt-2 p-2 rounded-md border-2 border-zinc-300">
                        <p className="break-all font-mono">{xPub}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card flex bg-zinc-100 rounded-md p-3 m-2">
              <div className="card-body">
                <h2 className="card-title">
                  <p className="text-lg mr-2">
                    <b>xPrv</b>
                  </p>
                </h2>
                <p className="text-base p-2">
                  {translate(xPrvDescription1)}{" "}
                  <b>
                    <u>{translate(xPrvDescription2)}</u>
                  </b>{" "}
                  <b>
                    <u>
                      <span className={"text-red-500"}>
                        {translate(xPrvDescription3)}
                      </span>{" "}
                    </u>
                  </b>
                </p>

                <div className="card-actions">
                  <div
                    onClick={() => {
                      setIsShowxPrv(!isShowxPrv);
                    }}
                    className={`rounded-lg p-3 bg-primary text-zinc-50 w-full shadow-sm`}
                  >
                    <div className="flex items-center">
                      {isShowxPrv && (
                        <EyeInvisibleOutlined className="text-2xl mr-1" />
                      )}
                      {!isShowxPrv && <EyeOutlined className="text-2xl mr-1" />}
                      <div className="text-lg font-medium flex-1 text-center">
                        {isShowxPrv
                          ? translate(hideXPrv)
                          : translate(revealXPrv)}
                      </div>
                    </div>
                  </div>

                  {isShowxPrv && (
                    <div className="w-full">
                      <div className="mt-2 p-2 rounded-md border-2 border-zinc-300">
                        <p className="break-all font-mono">{xPrv}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </SettingsChild>
    </>
  );
}
