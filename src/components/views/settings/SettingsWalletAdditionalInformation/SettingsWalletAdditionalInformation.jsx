import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  BranchesOutlined,
  LockOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

import * as bip39 from "bip39";
import {
  deriveHdPrivateNodeFromSeed,
  encodeHdPrivateKey,
  deriveHdPublicNode,
  encodeHdPublicKey,
} from "@bitauth/libauth";

import WalletManagerService from "@/services/WalletManagerService";

import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";

import { selectBchNetwork } from "@/redux/preferences";

import { translate } from "@/util/translations";
import translations from "./translations";
import { DEFAULT_DERIVATION_PATH } from "@/util/crypto";

export default function SettingsWalletAdditionalInformation() {
  const { wallet_id } = useParams();

  const [isShowXpub, setIsShowXpub] = useState(false);
  const [isShowxPrv, setIsShowxPrv] = useState(false);

  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWalletById(wallet_id);

  const derivationPath = wallet.derivation;

  const network = useSelector(selectBchNetwork);

  const seed = bip39.mnemonicToSeedSync(wallet.mnemonic);
  const hdMaster = deriveHdPrivateNodeFromSeed(seed);
  const xPrv = encodeHdPrivateKey({ node: hdMaster, network });

  const hdMasterPublic = deriveHdPublicNode(hdMaster);
  const xPub = encodeHdPublicKey({ node: hdMasterPublic, network });

  return (
    <>
      <ViewHeader
        icon={InfoCircleOutlined}
        title={translate(translations.additionalWalletInformation)}
      />
      <div className="p-2">
        <Accordion
          icon={BranchesOutlined}
          title={translate(translations.derivationPathTitle)}
        >
          <Accordion.Child>
            <div className="text-left font-mono font-bold">
              {derivationPath}
            </div>
          </Accordion.Child>
          <Accordion.Child>
            <div className="text-left">
              {translate(translations.derivationPathExplanation)}{" "}
              <span className="font-mono text-sm">
                {DEFAULT_DERIVATION_PATH}
              </span>
            </div>
          </Accordion.Child>
        </Accordion>

        <Accordion icon={ContainerOutlined} title="xPub">
          <Accordion.Child>
            <div className="flex flex-col gap-y-2 text-left">
              {translate(translations.xPubDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(translations.xPubDescription2)}{" "}
                {translate(translations.xPubDescription3)}
              </span>
            </div>
          </Accordion.Child>
          <Accordion.Child>
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
                    {isShowXpub
                      ? translate(translations.hideXpub)
                      : translate(translations.revealXpub)}
                  </div>
                </div>
              </button>

              {isShowXpub && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300 text-left">
                  <div className="break-all font-mono select-all">{xPub}</div>
                </div>
              )}
            </div>
          </Accordion.Child>
        </Accordion>

        <Accordion icon={LockOutlined} title="xPrv">
          <Accordion.Child>
            <div className="flex flex-col gap-y-2 text-left">
              {translate(translations.xPrvDescription1)}{" "}
              <span className="font-bold text-underline">
                {translate(translations.xPrvDescription2)}{" "}
                <span className="text-red-500">
                  {translate(translations.xPrvDescription3)}
                </span>
              </span>
            </div>
          </Accordion.Child>

          <Accordion.Child>
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
                    {isShowxPrv
                      ? translate(translations.hideXprv)
                      : translate(translations.revealXprv)}
                  </div>
                </div>
              </button>

              {isShowxPrv && (
                <div className="mt-2 p-2 rounded-md border-2 border-zinc-300 text-left">
                  <div className="break-all font-mono select-all">{xPrv}</div>
                </div>
              )}
            </div>
          </Accordion.Child>
        </Accordion>
      </div>
    </>
  );
}
