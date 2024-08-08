import { useState } from "react";
import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";
import EmbeddedIFrame from "@/components/atoms/EmbeddedIFrame/EmbeddedIFrame";

const AFITH_OF_GAMING_STATS_URL = "https://afifthofgaming.com/stats";
const BCH_GURU_STATS_URL = "https://nfts.bch.guru/science";

export default function ExploreStatsView() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSubsectionIndex, setSelectedSubsectionIndex] = useState(0);

  const SUBSECTIONS = [
    {
      name: "Selene",
      children: <div className="p-2">
        <ExploreStatBlock />
        <GlobalAdoptionSummary />
      </div>
    },
    {
      name: "A Fifth Of Gaming",
      children: <EmbeddedIFrame src={AFITH_OF_GAMING_STATS_URL} />
    }, {
      name: "BCH Guru",
      children: <EmbeddedIFrame src={BCH_GURU_STATS_URL} />
    }
  ]

  return (
    <div className="h-full">
      {SUBSECTIONS[selectedSubsectionIndex].children}

      {!isMenuOpen && (
        <div
          className="fixed mb-16 bottom-0 left-0 right-0 bg-red-400 text-red p-2 flex justify-between items-center"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className="w-6"></div>
          <span className="text-lg font-semibold">{SUBSECTIONS[selectedSubsectionIndex].name}</span>
          <button className="text-2xl">☰</button>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed mb-16 bottom-0 left-0 right-0 bg-gray-200 text-red p-3 flex flex-col justify-between items-center">
          {SUBSECTIONS.map((subsection, i) => (
            <span
              key={subsection.name}
              className={`bg-${i % 2 === 0 ? "cyan" : "lime"}-300 ${i !== 0 && "mt-1"} w-full text-center`}
              onClick={() => {
                setSelectedSubsectionIndex(i);
                setIsMenuOpen(false);
              }}
            >
              <div className="w-6"></div>
              <span className="text-lg font-semibold">{subsection.name}</span>
              <div className="w-6"></div>
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
