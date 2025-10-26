import {
  LikeOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import ExploreApp from "./ExploreApp";
import LinkExternal from "@/atoms/LinkExternal";
import SeleneLogo from "@/atoms/SeleneLogo";
import Card from "@/atoms/Card";
import StatsGraphCard from "@/apps/stats/StatsGraphCard";
import Carousel from "@/atoms/Carousel";
import useRealTime from "@/hooks/useRealTime";

import { translate } from "@/util/translations";
import translations from "./translations";
//import BlissAppCard from "../apps/bliss/BlissAppCard";
import BlazeAppCard from "../apps/blaze/BlazeAppCard";

import { BLAZE_2025_HIDE_CARD_DATE } from "../apps/blaze/constants";

export default function ExploreViewHome() {
  const now = useRealTime(1000);
  const isBlazeOngoing = now.valueOf() <= BLAZE_2025_HIDE_CARD_DATE.valueOf();

  return (
    <div className="p-1.5 flex flex-col gap-2">
      <Carousel autoRotateInterval={10000}>
        {isBlazeOngoing && <BlazeAppCard />}
        {/* <BlissAppCard /> */}
        <StatsGraphCard />
      </Carousel>
      <Card>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xl font-bold">
            <SeleneLogo className="w-12 mr-1" />
            <span>{translate(translations.learnMore)}</span>
          </div>
          <LinkExternal to="https://minisatoshi.cash/ecosystem" inAppBrowser>
            <ExploreApp
              icon={GlobalOutlined}
              name={translate(translations.ecosystem)}
            />
          </LinkExternal>
          <LinkExternal to="https://bitcoincashpodcast.com/faqs" inAppBrowser>
            <ExploreApp
              icon={QuestionCircleOutlined}
              name={translate(translations.faqs)}
            />
          </LinkExternal>
          <LinkExternal to="https://minisatoshi.cash/#_socials" inAppBrowser>
            <ExploreApp
              icon={LikeOutlined}
              name={translate(translations.socialMedia)}
            />
          </LinkExternal>
        </div>
      </Card>
    </div>
  );
}
