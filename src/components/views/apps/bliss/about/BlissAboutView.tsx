import { Interval } from "luxon";
import { LinkOutlined } from "@ant-design/icons";
import { EmbeddedVideoCard } from "@/components/atoms/EmbeddedVideo";
import FullColumn from "@/layout/FullColumn";
import {
  BLISS_2026_END_DATE,
  BLISS_2026_START_DATE,
  BLISS_ABOUT_VIDEO_URL,
  VELMA_VIDEO_URL,
  BLISS_HOME_URL,
  TAPSWAP_TICKETS_URL,
} from "../constants.jsx";
import { translate } from "@/util/translations";
import translations from "../translations";
import LinkItem from "@/components/atoms/LinkItem.js";

import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";

const interval = Interval.fromDateTimes(
  BLISS_2026_START_DATE,
  BLISS_2026_END_DATE
);

function BlissAboutView() {
  const wallet = useSelector(selectActiveWallet);

  return (
    <FullColumn>
      <div className="px-2 py-4">
        <h1 className="font-bliss text-2xl text-[#e8078c] bg-[linear-gradient(to_bottom,_rgb(232,_7,_140),_rgb(160,_137,_191))] bg-clip-text text-transparent">
          BLISS 2026
        </h1>
        <div className=" text-lg">Dublin, Ireland</div>

        <div className=" text-md">
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
      </div>
    </FullColumn>
  );
}

export default BlissAboutView;
