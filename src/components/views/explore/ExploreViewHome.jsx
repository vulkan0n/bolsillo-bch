import {
  BankOutlined,
  ContactsOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ExploreStatBlock from "./ExploreStatBlock";
import ExploreApp from "./ExploreApp";

export default function ExploreViewHome() {
  return (
    <div className="p-2">
      <ExploreStatBlock />
      <ExploreApp icon={BankOutlined} name="Assets" to="/wallet/assets" />
      <ExploreApp
        icon={ContactsOutlined}
        name="Contacts"
        to="/explore/contacts"
      />
      <ExploreApp icon={EnvironmentOutlined} name="Map" to="/explore/map" />
      <ExploreApp
        icon={QuestionCircleOutlined}
        name="Help"
        to="/explore/help"
      />
    </div>
  );
}
