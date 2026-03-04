import { useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import { InAppBrowser } from "@capacitor/inappbrowser";

import { selectDevicePlatform } from "@/redux/device";

import translations from "@/views/settings/translations";

import { translate } from "@/util/translations";

export function useNavigateExternal() {
  const platform = useSelector(selectDevicePlatform);

  return async (to: string) => {
    const { value: shouldProceed } = await Dialog.confirm({
      title: translate(translations.externalLinkTitle),
      message: `${translate(translations.externalLinkMessage)}\n\n${to}`,
    });

    if (!shouldProceed) {
      return;
    }

    if (platform === "web") {
      window.open(to);
    } else {
      await InAppBrowser.openInExternalBrowser({
        url: to,
      });
    }
  };
}
