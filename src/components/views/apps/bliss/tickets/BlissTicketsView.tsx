import FullColumn from "@/layout/FullColumn";
import { EmbeddedVideoCard } from "@/components/atoms/EmbeddedVideo";

import { translate } from "@/util/translations";
import translations from "../translations";

import {
  TAPSWAP_TICKETS_URL,
  TAPSWAP_TUTORIAL_VIDEO_URL,
  TICKETS_READ_MORE_URL,
} from "../constants.jsx";

function BlissTicketsView() {
  return (
    <FullColumn>
      <div className="px-2 py-4">
        <h1 className="font-bliss text-2xl text-[#e8078c] bg-[linear-gradient(to_bottom,_rgb(232,_7,_140),_rgb(160,_137,_191))] bg-clip-text text-transparent">
          Tickets
        </h1>
        <div>
          <p1>Entry to BLISS 2026 requires a Layla NFT.</p1>
        </div>
        <div>
          <p1>Your tickets</p1>
        </div>
        <div>
          <p1>Available tickets</p1>
        </div>

        <h2 className="font-bold text-xl mt-6 ">
          {translate(translations.howToTicketsTitle)}
        </h2>
        <ol className="bg-neutral rounded-lg mt-4 flex flex-col overflow-hidden p-6 list-decimal *:ml-4 flex flex-col gap-2">
          <li>{translate(translations.howToTicketsStepOne)}</li>
          <li>{translate(translations.howToTicketsStepTwo)}</li>
          <li>
            {translate(translations.howToTicketsStepThree)}{" "}
            <a className="text-primary" href={TAPSWAP_TICKETS_URL}>
              tapswap.cash ↗
            </a>
          </li>
          <li>{translate(translations.howToTicketsStepFour)}</li>
          <li>{translate(translations.howToTicketsStepFive)}</li>
          <a href={TICKETS_READ_MORE_URL} className="mt-4 !ml-0 text-primary">
            {translate(translations.howToTicketsReadMore)} →
          </a>
        </ol>
        <div className="mt-4" />
        <EmbeddedVideoCard url={TAPSWAP_TUTORIAL_VIDEO_URL} />
      </div>
    </FullColumn>
  );
}

export default BlissTicketsView;
