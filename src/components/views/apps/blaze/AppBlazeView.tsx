import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";

//import NavTab from "@/components/layout/NavTab";
import BlazeAboutView from "./about/BlazeAboutView";

//import { BankOutlined, InfoCircleOutlined } from "@ant-design/icons";

function AppBlazeView() {
  return (
    <FullColumn>
      <ViewHeader
        title={<span className="font-bliss">BCH BLAZE</span>}
        close="/explore"
      />
      {/*<div className="flex">
        <NavTab
          to="/apps/blaze/about"
          label={"About"}
          icon={InfoCircleOutlined}
          activeIcon={InfoCircleOutlined}
        />
        </div>*/}

      <FullColumn>
        <BlazeAboutView />
      </FullColumn>
    </FullColumn>
  );
}

export default AppBlazeView;
