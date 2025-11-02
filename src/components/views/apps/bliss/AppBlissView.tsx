import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import { translate } from "@/util/translations";
import translations from "./translations";

import NavTab from "@/components/layout/NavTab";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";

import {
  BankOutlined,
  MoneyCollectOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

function AppBlissView() {
  const wallet = useSelector(selectActiveWallet);

  return (
    <FullColumn>
      <ViewHeader icon={BankOutlined} title={"BLISS 2026"} close="/explore" />
      <div className="flex">
        <NavTab
          to="/apps/bliss/about"
          label={"About"}
          icon={DeploymentUnitOutlined}
          activeIcon={DeploymentUnitOutlined}
        />
        <NavTab
          to="/apps/bliss/tickets"
          label={translate(translations.tickets)}
          icon={MoneyCollectOutlined}
          activeIcon={MoneyCollectOutlined}
        />
        <NavTab
          to="/apps/bliss/tokenHunt"
          label={"Token Hunt"}
          icon={MoneyCollectOutlined}
          activeIcon={MoneyCollectOutlined}
        />
      </div>
      <Outlet context={wallet} />
    </FullColumn>
  );
}

export default AppBlissView;
