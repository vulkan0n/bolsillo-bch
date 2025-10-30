import { useSelector } from "react-redux";
import { InAppBrowser } from "@capacitor/inappbrowser";
import { Dialog } from "@capacitor/dialog";
import { selectDevicePlatform } from "@/redux/device";

import { translate } from "@/util/translations";
import translations from "@/views/settings/translations";

export default function LinkExternal({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const platform = useSelector(selectDevicePlatform);

  const handleClick = async (e) => {
    e.stopPropagation();

    const { value: shouldProceed } = await Dialog.confirm({
      title: translate(translations.externalLinkTitle),
      message: `${translate(translations.externalLinkMessage)}\n\n${to}`,
    });

    if (!shouldProceed) {
      return;
    }

    if (platform === "web") {
      window.open(to);
      return;
    }

    await InAppBrowser.openInExternalBrowser({
      url: to,
    });
  };

  return (
    <div onClick={handleClick} className={`${className} cursor-pointer`}>
      {children}
    </div>
  );
}
