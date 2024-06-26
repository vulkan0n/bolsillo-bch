import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";

export default function StatsView() {
  return (
    <div className="p-2">
      <ExploreStatBlock />
      <GlobalAdoptionSummary />
    </div>
  );
}
