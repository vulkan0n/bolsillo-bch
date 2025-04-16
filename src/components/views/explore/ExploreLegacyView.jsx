import ExploreStatBlock from "@/apps/stats/ExploreStatBlock";
import GlobalAdoptionSummary from "@/apps/stats/GlobalAdoptionSummary";
import BlissAppCard from "@/apps/bliss/Card";

export default function ExploreLegacyView() {
  return (
    <div className="p-2 flex flex-col gap-2">
      <ExploreStatBlock />
      <GlobalAdoptionSummary />
      <BlissAppCard />
    </div>
  );
}
