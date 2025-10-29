import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";

import NavTab from "@/components/layout/NavTab";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";

import { BankOutlined, InfoCircleOutlined } from "@ant-design/icons";

function AppBlazeView() {
  const wallet = useSelector(selectActiveWallet);

  return (
    <FullColumn>
      <ViewHeader icon={BankOutlined} title={"BCH BLAZE"} close="/explore" />
      <div className="flex">
        <NavTab
          to="/apps/blaze/about"
          label={"About"}
          icon={InfoCircleOutlined}
          activeIcon={InfoCircleOutlined}
        />
      </div>
      <Outlet context={wallet} />
    </FullColumn>
  );
}

export default AppBlazeView;
