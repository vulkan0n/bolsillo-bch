import { ArrowRightOutlined } from "@ant-design/icons";
import { DateTime, Interval } from "luxon";
import { Link } from "react-router";
import velma from "@/assets/bliss-velma.png";
import useRealTime from "@/hooks/useRealTime";
import { translate } from "@/util/translations";
import translations from "./translations";
import StatsGraphCard from "@/apps/stats/StatsGraphCard";

export const BLISS_2025_START_DATE = new Date("2025-05-13T09:00:00+02:00");
export const BLISS_2025_END_DATE = new Date("2025-05-15T16:00:00+02:00");
const BLISS_2025_GRACE_PERIOD = DateTime.fromJSDate(BLISS_2025_END_DATE).plus({
  weeks: 3,
});
const BCH_PODCAST_LIVE_URL =
  "https://www.youtube.com/@BitcoinCashPodcast/streams";

const pad = (value: number) => value.toString().padStart(2, "0");

function BlissAppCard() {
  const now = useRealTime(1000);

  if (now.valueOf() > BLISS_2025_GRACE_PERIOD.valueOf()) {
    return <StatsGraphCard />;
  }

  const isBefore = now.valueOf() < BLISS_2025_START_DATE.valueOf();

  const isDuring =
    now.valueOf() >= BLISS_2025_START_DATE.valueOf() &&
    now.valueOf() <= BLISS_2025_END_DATE.valueOf();

  const isAfter = now.valueOf() > BLISS_2025_END_DATE.valueOf();

  const interval = Interval.fromDateTimes(now, BLISS_2025_START_DATE);

  const days = Math.floor(interval.length("hours") / 24);
  const hours = pad(Math.floor(interval.length("hours") % 24));
  const minutes = pad(Math.floor(interval.length("minutes") % 60));
  const seconds = pad(Math.floor(interval.length("seconds") % 60));

  let description = translate(translations.startingIn);

  if (isAfter) {
    description = translate(translations.watchVideos);
  } else if (isDuring) {
    description = translate(translations.watchLive);
  }

  return (
    <Link
      to={isDuring ? BCH_PODCAST_LIVE_URL : "/apps/bliss"}
      className="shadow rounded-lg  overflow-hidden relative"
    >
      <img src={velma} className="w-full" />
      <div className="absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.8)] text-white p-6 flex justify-between gap-4">
        <div>
          <div className="font-bold text-xl mb-2">
            <span className="font-bliss">BLISS</span>
          </div>
          <div className="leading-[1rem]">
            {description}{" "}
            {isBefore && (
              <span className="font-mono">
                {days}d:
                {hours}h:
                {minutes}m:
                {seconds}s
              </span>
            )}
          </div>
        </div>
        <ArrowRightOutlined className="text-xl" />
      </div>
    </Link>
  );
}

export default BlissAppCard;
