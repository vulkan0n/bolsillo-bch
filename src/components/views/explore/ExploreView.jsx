import {
  AppstoreOutlined,
  BankOutlined,
  ContactsOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import ExploreSearchBar from "./ExploreSearchBar";
import ExploreStatBlock from "./ExploreStatBlock";
import ExploreApp from "./ExploreApp";

export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore BCH" />
      <ExploreSearchBar />
      <div className="p-2 my-0.5">
        <ExploreStatBlock />
        <ExploreApp icon={BankOutlined} name="Assets" />
        <ExploreApp icon={ContactsOutlined} name="Contacts" />
        <ExploreApp icon={EnvironmentOutlined} name="Map" />
        <ExploreApp icon={QuestionCircleOutlined} name="Help" />
      </div>
    </>
  );
}
