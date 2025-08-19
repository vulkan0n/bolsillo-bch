/*import { Interval } from "luxon";
import { LinkOutlined } from "@ant-design/icons";
import { EmbeddedVideoCard } from "@/components/atoms/EmbeddedVideo";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import { BLISS_2025_END_DATE, BLISS_2025_START_DATE } from "./BlissAppCard";
import { translate } from "@/util/translations";
import translations from "./translations";

const BLISS_ABOUT_VIDEO_URL =
  "https://www.youtube.com/watch?v=ddVj8LepAPs&pp=0gcJCX4JAYcqIYzv";
const VELMA_VIDEO_URL = "https://www.youtube.com/watch?v=uOIzAcCap6A";
const TICKETS_READ_MORE_URL = "https://bliss.cash/2025#tickets";
const BLISS_HOME_URL = "https://bliss.cash";
const TAPSWAP_TICKETS_URL =
  "https://tapswap.cash/trade/5a4f6b25243c1a2dabb2434e3d9e574f65c31764ce0e7eb4127a46fa74657691";
const TAPSWAP_TUTORIAL_VIDEO_URL =
  "https://www.youtube.com/watch?v=kzbIJ6pDV8E";

function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-primary flex items-center gap-2 w-full py-6 px-6 border-b border-[#ececec] last:border-b-0"
    >
      <LinkOutlined /> <span className="flex-1">{label}</span> <span>→</span>
    </a>
  );
}

const interval = Interval.fromDateTimes(
  BLISS_2025_START_DATE,
  BLISS_2025_END_DATE
);

function AppBlissView() {
  return (
    <FullColumn>
      <ViewHeader title={translate(translations.about)} close="/explore" />
      <div className="px-4 py-8">
        <h1 className="font-bliss text-2xl text-[#e8078c] bg-[linear-gradient(to_bottom,_rgb(232,_7,_140),_rgb(160,_137,_191))] bg-clip-text text-transparent">
          BCH BLISS 2025
        </h1>
        <div className=" text-xl font-bold">
          {interval.toLocaleString({
            dateStyle: "long",
          })}
        </div>
        <div className="mt-2">{translate(translations.intro)}</div>
        <div className="bg-neutral rounded-lg  mt-6 flex flex-col overflow-hidden">
          <LinkItem href={BLISS_HOME_URL} label="bliss.cash" />
          <LinkItem
            href={TAPSWAP_TICKETS_URL}
            label={translate(translations.tickets)}
          />
        </div>
        <div className="mt-4" />
        <h2 className="font-bold text-xl mt-6 mb-4 ">
          {translate(translations.about)}
        </h2>
        <EmbeddedVideoCard url={BLISS_ABOUT_VIDEO_URL} />
        <h2 className="font-bold text-xl mt-6 mb-4 ">
          {translate(translations.velmaUpgrade)}
        </h2>
        <EmbeddedVideoCard url={VELMA_VIDEO_URL} />
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

export default AppBlissView;*/
