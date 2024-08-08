import { useState } from "react";
import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";
import EmbeddedIFrame from "@/components/atoms/EmbeddedIFrame/EmbeddedIFrame";

const AFITH_OF_GAMING_STATS_URL = "https://afifthofgaming.com/stats";
const BCH_GURU_STATS_URL = "https://nfts.bch.guru/science";
const TOKENAUT_URL = "https://tokenaut.cash/";
const DEFI_LLAMA_URL = "https://defillama.com/chain/Bitcoincash"

export default function ExploreStatsView() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSubsectionIndex, setSelectedSubsectionIndex] = useState(0);

  const SUBSECTIONS = [
    {
      name: "Selene",
      children: <div className="pb-12">
        <div className="p-2">
          <ExploreStatBlock />
          <GlobalAdoptionSummary />
        </div>
      </div>
    },
    {
      name: "A Fifth Of Gaming",
      children: <EmbeddedIFrame src={AFITH_OF_GAMING_STATS_URL} />
    },
    {
      name: "BCH Guru",
      children: <EmbeddedIFrame src={BCH_GURU_STATS_URL} />
    },
    {
      name: "Tokenaut",
      children: <EmbeddedIFrame src={TOKENAUT_URL} />
    },
    {
      name: "DeFi Llama",
      children: <EmbeddedIFrame src={DEFI_LLAMA_URL} />
    }
  ]

  return (
    <div className="h-full">
      <div className="h-full pb-12">
        {SUBSECTIONS[selectedSubsectionIndex].children}
      </div>

      {!isMenuOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 bg-gray-300 text-red p-3 flex justify-between items-center"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className="w-6"></div>
          <span className="text-lg font-semibold">{SUBSECTIONS[selectedSubsectionIndex].name}</span>
          <button className="text-2xl">☰</button>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-gray-200 text-red p-3 flex flex-col justify-between items-center">
          {SUBSECTIONS.map((subsection, i) => {
            const isLastElement = i === SUBSECTIONS.length - 1;
            return (
              <div
                key={subsection.name}
                className={`${i !== 0 && "mt-1"} w-full flex justify-between items-center text-center`}
                onClick={() => {
                  setSelectedSubsectionIndex(i);
                  setIsMenuOpen(false);
                }}
              >
                <div className="w-6"></div>
                <span className="text-center bg-zinc-300 w-full mx-3">
                  <span className="text-lg font-semibold">{subsection.name}</span>
                </span>
                {!isLastElement && <div className="w-6"></div>}
                {isLastElement && <button className="text-2xl">☰</button>}
              </div>
            )
          })}
        </div>
      )}

    </div>
  );
}
