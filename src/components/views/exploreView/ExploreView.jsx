import { AppstoreOutlined } from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import moment from "moment";
import { useCountdown } from "./useCountdown";

export default function ExploreView() {
  const midnightUtc = moment().utc().endOf("day");
  const [days, hours, minutes, seconds] = useCountdown(midnightUtc);

  return (
    <>
      <ViewHeader icon={AppstoreOutlined} title="Explore" />
      <div className="p-2">
        <div className="stats shadow rounded-lg p-3 bg-zinc-800 w-full">
          <div className="text-2xl font-bold text-zinc-300">
            Global Bitcoin Cash Adoption
          </div>
          <div className="stat">
            <div className="stat-title text-zinc-300">
              Selene Daily Active Users
            </div>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-base font-small text-primary">
              Today ({hours}h {minutes}m {seconds}s remaining)
            </span>
            <span className="text-sm font-small text-primary">
              10 of 10 million (45%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4.5 dark:bg-gray-500">
            <div
              className="bg-green-200 h-2.5 rounded-full"
              style={{ width: "45%" }}
            ></div>
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-primary">
              Yesterday
            </span>
            <span className="text-sm font-medium text-primary">
              10 of 10 million (45%)
            </span>
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
        </div>
      </div>
    </>
  );
}
