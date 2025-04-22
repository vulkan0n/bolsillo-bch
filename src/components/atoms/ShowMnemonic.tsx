import { useState } from "react";
import { useDispatch } from "react-redux";
import { WarningFilled, EyeInvisibleOutlined } from "@ant-design/icons";
import { Dialog } from "@capacitor/dialog";

import { walletSetKeyViewed } from "@/redux/wallet";
import WalletManagerService from "@/services/WalletManagerService";
import SecurityService, { AuthActions } from "@/services/SecurityService";

import { useLongPress } from "@/hooks/useLongPress";
import { useClipboard } from "@/hooks/useClipboard";

import { translate } from "@/util/translations";
import translations from "@/components/views/settings/SettingsWalletView/translations";

export default function ShowMnemonic({ walletHash }: { walletHash: string }) {
  const dispatch = useDispatch();
  const WalletManager = WalletManagerService();

  const { handleCopyToClipboard } = useClipboard();

  // toggle visibility for recovery phrase
  const [shouldShowRecoveryPhrase, setShouldShowRecoveryPhrase] =
    useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");

  // handler for mnemonic visibility area
  const handleShowMnemonic = async () => {
    if (shouldShowRecoveryPhrase === false) {
      const isAuthorized = await SecurityService().authorize(
        AuthActions.RevealPrivateKeys
      );
      if (!isAuthorized) {
        return;
      }

      await WalletManager.openWalletDatabase(walletHash);
      const { mnemonic: m, passphrase: p } =
        WalletManager.getWallet(walletHash);

      setShouldShowRecoveryPhrase(true);
      setMnemonic(m);
      setPassphrase(p);
      dispatch(walletSetKeyViewed({ walletHash }));
    } else {
      setMnemonic("");
      setShouldShowRecoveryPhrase(false);
    }
  };

  const handleClipboardCopy = async () => {
    const { value: hasConsent } = await Dialog.confirm({
      title: translate(translations.copyToClipboardPromptTitle),
      message: translate(translations.copyToClipboardPromptMessage),
      okButtonTitle: translate(translations.proceed),
    });
    if (!hasConsent) {
      return;
    }

    const isAuthorized = await SecurityService().authorize(
      AuthActions.RevealPrivateKeys
    );
    if (!isAuthorized) {
      return;
    }

    const hasPassphrase = passphrase !== "";
    const clipboardString = hasPassphrase
      ? `${mnemonic} — ${translate(translations.passphrase)}: ${passphrase}`
      : mnemonic;

    handleCopyToClipboard(
      clipboardString,
      translate(translations.copiedToClipboardSuccess),
      hasPassphrase ? translate(translations.copiedToClipboardPassphrase) : ""
    );
  };

  const wallet = WalletManager.getWalletMeta(walletHash);

  const isKeyViewed = wallet.key_viewed_at !== null;
  const keyNotViewedClasses = isKeyViewed
    ? "bg-neutral-700"
    : "border border-4 rounded-lg border-primary bg-primary";

  const handleLongPress = async () => {
    if (shouldShowRecoveryPhrase === false && isKeyViewed === false) return;
    await handleClipboardCopy();
  };

  const longPressEvents = useLongPress<
    React.TouchEvent<HTMLButtonElement> | React.MouseEvent
  >(handleLongPress, handleShowMnemonic);

  const splitMnemonic = mnemonic.split(" ");

  return (
    <button
      type="button"
      className={`w-full flex-col rounded-lg flex items-center justify-center my-2 px-2 py-4 cursor-pointer ${keyNotViewedClasses}`}
      // eslint-disable-next-line
      {...longPressEvents}
    >
      {shouldShowRecoveryPhrase ? (
        <div className="flex flex-col justify-between items-center">
          <div className="text-center text-error text-xl font-bold">
            <WarningFilled className="mr-2 text-warning" />
            {translate(translations.keepSecret)}
            <WarningFilled className="ml-2 text-warning" />
          </div>
          <div className="text-center text-neutral-50 text-xl py-4 select-all grid gap-md grid-cols-3 gap-2 font-mono">
            {splitMnemonic.map((w, idx) => (
              <div
                key={`w-${w}`}
                className="col-span-1 rounded-2xl border whitespace-nowrap px-2 py-1 text-sm flex select-none"
              >
                <span className="text-neutral-300">{idx + 1}.</span>{" "}
                <span className="flex-1 text-center">{w}</span>
              </div>
            ))}
          </div>
          <div className="text-center text-error text-xl font-bold">
            <WarningFilled className="mr-2 text-warning" />
            {translate(translations.dontStoreDigitally)}
            <WarningFilled className="ml-2 text-warning" />
          </div>
        </div>
      ) : (
        <>
          <EyeInvisibleOutlined className="text-8xl text-neutral-50" />
          <div className="text-center text-neutral-50 text-xl">
            {translate(translations.viewRecoveryPhrase)}
          </div>
          <div className="text-center text-neutral-200 text-lg opacity-90">
            ({translate(translations.secretAndSecure)})
          </div>
        </>
      )}
    </button>
  );
}
