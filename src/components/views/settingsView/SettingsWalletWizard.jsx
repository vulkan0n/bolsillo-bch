import { Outlet } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";

import ViewHeader from "@/components/views/ViewHeader";
import { logos } from "@/util/logos";

export default function SettingsWalletWizard() {
  return (
    <div className="bg-zinc-300 h-full">
      <ViewHeader icon={PlusCircleOutlined} title="Create/Import Wallet" />
      <div className="flex items-center justify-center p-8 h-1/3 bg-zinc-800">
        <img src={logos.selene.img} className="h-full" />
      </div>
      <div className="p-4 mt-2">
        <Outlet />
      </div>
    </div>
  );
}
