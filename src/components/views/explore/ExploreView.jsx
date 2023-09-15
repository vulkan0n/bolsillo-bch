import {
  AppstoreOutlined,
  ToolOutlined,
  QuestionCircleOutlined,
  BarsOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";

export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore BCH" />
      <ExploreSearchBar />
      <div className="p-2 my-0.5">
        <StatBlock />
        <Accordion icon={ToolOutlined} title="Tools">
          <Accordion.Child icon={BarsOutlined} label="Addresses" />
        </Accordion>
        <Accordion icon={QuestionCircleOutlined} title="Help">
          <Accordion.Child label="Help" />
        </Accordion>
      </div>
    </>
  );
}

function ExploreSearchBar() {
  return (
    <div className="border border-primary shadow bg-primary text-white">
      <div className="flex justify-center items-center p-2">
        <SearchOutlined className="text-2xl" />
        <input
          type="text"
          placeholder="Search"
          className="w-full ml-2 p-2 border border-primary rounded-md shadow-inner"
        />
      </div>
    </div>
  );
}

function StatBlock() {
  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
      <div className="p-1 mx-1">
        <div className="font-bold text-zinc-300">Daily Users</div>
        <div className="text-primary text-lg font-semibold">1337</div>
        <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
      </div>

      <div className="p-1 mx-1">
        <div className="font-bold text-zinc-300">Monthly Users</div>
        <div className="text-primary text-lg font-semibold">23,505</div>
        <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
      </div>

      <div className="p-1 mx-1">
        <div className="font-bold text-zinc-300">BCH/USD</div>
        <div className="text-primary text-lg font-semibold">$142.13</div>
        <div className="text-xs text-zinc-400">↗︎ $0.42 (3%)</div>
      </div>
    </div>
  );
}
