export default function ExploreStatBlock() {
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
