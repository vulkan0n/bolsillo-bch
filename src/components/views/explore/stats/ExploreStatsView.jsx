import { useState } from "react";
import ExploreStatBlock from "./ExploreStatBlock";
import GlobalAdoptionSummary from "./GlobalAdoptionSummary";

export default function ExploreStatsView() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SUBSECTIONS = [
    { name: "Selene" },
    { name: "A Fifth Of Gaming" }
  ]

  return (
    <div className="p-2">
      {/* <ExploreStatBlock />
      <GlobalAdoptionSummary /> */}
      {/* <iframe
        src="https://afifthofgaming.com/stats"
        title="Embedded Web Page"
        width="100%"
        height="500px"
        frameBorder="0"
        allowFullScreen
      /> */}
      <h1>{isMenuOpen ? "true" : "false"}</h1>

      {!isMenuOpen && (
        <div
          className="fixed mb-16 bottom-0 left-0 right-0 bg-red-400 text-red p-2 flex justify-between items-center"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className="w-6"></div> {/* Spacer for alignment */}
          <span className="text-lg font-semibold">Selene</span>
          <button className="text-2xl">☰</button>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed mb-16 bottom-0 left-0 right-0 bg-gray-200 text-red p-2 flex flex-col justify-between items-center">
          {SUBSECTIONS.map((subsection, i) => (
            <span
              key={subsection.name}
              className={`bg-${i % 2 === 0 ? "cyan" : "lime"}-300 ${i !== 0 && "mt-1"} w-full text-center`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-6"></div> {/* Spacer for alignment */}
              <span className="text-lg font-semibold">{subsection.name}</span>
              <div className="w-6"></div> {/* Spacer for alignment */}
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
