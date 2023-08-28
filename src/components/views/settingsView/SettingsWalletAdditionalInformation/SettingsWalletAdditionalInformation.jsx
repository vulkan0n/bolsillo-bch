import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import {
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  encodeHdPrivateKey,
  deriveHdPublicNode,
  encodeHdPublicKey,
} from "@bitauth/libauth";

import WalletService from "@/services/WalletService";

import ViewHeader from "@/components/views/ViewHeader";
import SettingsCategory from "../SettingsCategory";

import { translate } from "@/util/translations";
import translations from "./translations";
import { SELENE_DEFAULT_DERIVATION_PATH } from "@/util/crypto";

const {
  additionalWalletInformation,
  derivationPathTitle,
  derivationPathExplanation,
  xPubDescription1,
  xPubDescription2,
  xPubDescription3,
  hideXpub,
  revealXpub,
  xPrvDescription1,
  xPrvDescription2,
  xPrvDescription3,
  hideXprv,
  revealXprv,
} = translations;

export default function SettingsWalletAdditionalInformation() {
  const { wallet_id } = useParams();

  const [isShowXpub, setIsShowXpub] = useState(false);
  const [isShowxPrv, setIsShowxPrv] = useState(false);

  const WalletManager = new WalletService();
  const wallet = WalletManager.getWalletById(wallet_id);

  // if invalid wallet_id passed via queryparams, redirect back to settings
  if (wallet === null) {
    return <Navigate to="/settings" />;
  }

  const derivationPath = wallet.derivation;

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
      <div className="p-2">
        <SettingsCategory title={translate(derivationPathTitle)}>
          <SettingsCategory.Child label={derivationPath} />
          <SettingsCategory.Child
            label={`${translate(
              derivationPathExplanation
            )} ${SELENE_DEFAULT_DERIVATION_PATH}`}
          />
        </SettingsCategory>

        <SettingsCategory title="xPub">
          <SettingsCategory.Child>
            <div className="flex flex-col gap-y-2">
              {translate(xPubDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(xPubDescription2)} {translate(xPubDescription3)}
              </span>
            </div>
          </SettingsCategory.Child>
          <SettingsCategory.Child>
            <div className="flex flex-col gap-y-1 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsShowXpub(!isShowXpub);
                }}
                className="rounded-lg p-3 bg-primary text-zinc-50 shadow-sm"
              >
                <div className="flex items-center">
                  {isShowXpub ? (
                    <EyeInvisibleOutlined className="text-2xl mr-1" />
                  ) : (
                    <EyeOutlined className="text-2xl mr-1" />
                  )}
                  <div className="text-lg font-medium flex-1 text-center">
                    {isShowXpub ? translate(hideXpub) : translate(revealXpub)}
                  </div>
                </div>
              </button>

              {isShowXpub && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300">
                  <div className="break-all font-mono select-all">{xPub}</div>
                </div>
              )}
            </div>
          </SettingsCategory.Child>
        </SettingsCategory>

        <SettingsCategory title="xPrv">
          <SettingsCategory.Child>
            <div className="flex flex-col gap-y-2">
              {translate(xPrvDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(xPrvDescription2)}{" "}
                <span className="text-red-500">
                  {translate(xPrvDescription3)}
                </span>
              </span>
            </div>
          </SettingsCategory.Child>

          <SettingsCategory.Child>
            <div className="flex flex-col gap-y-1 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsShowxPrv(!isShowxPrv);
                }}
                className="rounded-lg p-3 bg-primary text-zinc-50 w-full shadow-sm"
              >
                <div className="flex items-center">
                  {isShowxPrv && (
                    <EyeInvisibleOutlined className="text-2xl mr-1" />
                  )}
                  {!isShowxPrv && <EyeOutlined className="text-2xl mr-1" />}
                  <div className="text-lg font-medium flex-1 text-center">
                    {isShowxPrv ? translate(hideXprv) : translate(revealXprv)}
                  </div>
                </div>
              </button>

              {isShowxPrv && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300">
                  <div className="break-all font-mono select-all">{xPrv}</div>
                </div>
              )}
            </div>
          </SettingsCategory.Child>
        </SettingsCategory>
      </div>
    </>
  );
}
