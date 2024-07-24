import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";

export default function ExploreStatsView() {
  return (
    <div className="p-2">
      <ExploreStatBlock />
      <GlobalAdoptionSummary />
    </div>
  );
}
