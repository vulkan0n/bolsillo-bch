import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentPrice } from "@/redux/exchangeRates";

export default function ExploreStatBlock() {
  const price = useSelector(selectCurrentPrice);

  return (
    <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex-column justify-between items-center">
      <div className="w-full flex justify-center items-center">
        <span className="font-bold text-xl text-zinc-300">Selene Active Users</span>
      </div>
      <div className="shadow rounded-lg p-2 bg-zinc-900 w-full flex justify-between items-center">
        <Link to="/explore/stats/#d">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 24h</div>
            <div className="text-primary text-lg font-semibold">1337</div>
            <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>
        </Link>

        <Link to="/explore/stats/#m">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 30d</div>
            <div className="text-primary text-lg font-semibold">23,505</div>
            <div className="text-xs text-zinc-400">↗︎ 42 (3%)</div>
          </div>
        </Link>

        <Link to="/explore/stats/#y">
          <div className="p-1 mx-1">
            <div className="font-bold text-zinc-300">Last 365d</div>
            <div className="text-primary text-lg font-semibold">
              {price.priceString}
            </div>
            <div className="text-xs text-zinc-400">↗︎ $0.42 (3%)</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
