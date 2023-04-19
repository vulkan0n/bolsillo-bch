import { AppstoreOutlined } from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
export default function ExploreView() {
  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore BCH" />
      <div className="p-2">
        <div className="stats shadow rounded-lg p-3 bg-zinc-800 w-full">
          <div className="stat">
            <div className="stat-title font-bold text-zinc-300">
              Daily Users
            </div>
            <div className="stat-value text-primary text-lg font-semibold">
              1337
            </div>
            <div className="stat-desc text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>

          <div className="stat">
            <div className="stat-title font-bold text-zinc-300">
              Monthly Users
            </div>
            <div className="stat-value text-primary text-lg font-semibold">
              23,505
            </div>
            <div className="stat-desc text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>

          <div className="stat">
            <div className="stat-title font-bold text-zinc-300">BCH/USD</div>
            <div className="stat-value text-primary text-lg font-semibold">
              $142.13
            </div>
            <div className="stat-desc text-xs text-zinc-400">↗︎ $0.42 (3%)</div>
          </div>
        </div>
      </div>
    </>
  );
}
