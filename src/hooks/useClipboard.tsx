import { useCallback } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { SnippetsOutlined } from "@ant-design/icons";
import ToastService from "@/services/ToastService";

import { translate } from "@/util/translations";
import translations from "@/views/wallet/WalletViewButtons/translations";

export function useClipboard() {
  const handleCopyToClipboard = useCallback(
    async (string: string, type: string) => {
      await Clipboard.write({ string });
      ToastService().clipboardCopy(type, string);
    },
    []
  );

  const getClipboardContents = useCallback(async () => {
    // NOTE: Firefox does not support the Clipboard.read browser API yet!
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#clipboard_availability
    // Error: Reading from clipboard not supported in this browser
    // Firefox users must set "dom.events.asyncClipboard.read" to "true" in about:config
    const { value } = await Clipboard.read();

    const Toast = ToastService();
    const spawnPasteToast = () =>
      Toast.spawn({
        icon: <SnippetsOutlined className="text-primary text-4xl" />,
        header: translate(translations.pastedFromClipboard),
        body: <span className="flex break-all text-sm">{value}</span>,
      });
    return { value, spawnPasteToast };
  }, []);

  return { getClipboardContents, handleCopyToClipboard };
}
