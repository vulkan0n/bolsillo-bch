import { Interval } from "luxon";
import { EmbeddedVideoCard } from "@/components/atoms/EmbeddedVideo";
import FullColumn from "@/layout/FullColumn";
import { translate } from "@/util/translations";
import translations from "../translations";
import { BLAZE_EVENTS, SELENE_ASSETS_URL } from "../constants.jsx";
import LinkItem from "@/components/atoms/LinkItem";
import Card from "@/components/atoms/Card";

const BLAZE_INFORMATION_STREAM_URL =
  "https://www.youtube.com/watch?v=EufKujsTQGc";
const BLAZE_DORAHACKS_URL = "https://dorahacks.io/hackathon/bchblaze2025/detail";

const interval = Interval.fromDateTimes(
  BLAZE_EVENTS[0].startTime,
  new Date("2025-11-29T21:00:00+00:00")
);

function BlazeAboutView() {
  return (
    <FullColumn>
      <div className="px-2 pt-2">
        <Card className="mb-[5px]">
          <h1 className="font-bliss text-2xl text-black dark:text-white">
            BCH BLAZE
          </h1>
          <div className=" text-lg">
            Online!
          </div>

          <div className=" text-md">
            {interval.toLocaleString({
              dateStyle: "long",
            })}
          </div>
          <div className="mt-1">{translate(translations.intro)}</div>
          <div className="bg-neutral rounded-lg flex flex-col overflow-hidden">
            <LinkItem href={BLAZE_DORAHACKS_URL} label="DoraHacks Sign Up & Information" />
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-xl mt-1">
            {"BLAZE Schedule"}
          </h2>

          <img src={`${SELENE_ASSETS_URL}Schedule.png`} className="w-full h-64 pb-4" />

          <h2 className="font-bold text-xl mt-1">
            {"BLAZE Information Session"}
          </h2>
          <EmbeddedVideoCard url={BLAZE_INFORMATION_STREAM_URL} />
        </Card>
        <div className="mt-4" />
      </div>
    </FullColumn>
  );
}

export default BlazeAboutView;
