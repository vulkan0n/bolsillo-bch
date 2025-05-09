import {
  InfoCircleOutlined,
  LikeOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import ExploreApp from "./ExploreApp";
import ExploreStatWidget from "./ExploreStatWidget";
import LinkExternal from "@/atoms/LinkExternal";
import SeleneLogo from "@/atoms/SeleneLogo";
import Card from "@/atoms/Card";
import BlissAppCard from "@/apps/bliss/BlissAppCard";

import { translate } from "@/util/translations";
import translations from "./translations";

export default function ExploreViewHome() {
  return (
    <div className="p-1.5 flex flex-col gap-2">
      <ExploreStatWidget />
      <BlissAppCard />
      <Card>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xl font-bold">
            <SeleneLogo className="w-12 mr-1" />
            <span>{translate(translations.info)}</span>
          </div>
          <LinkExternal to="https://docs.selene.cash" inAppBrowser>
            <ExploreApp
              icon={QuestionCircleOutlined}
              name={translate(translations.help)}
            />
          </LinkExternal>
          <LinkExternal to="https://bitcoincashpodcast.com/faqs" inAppBrowser>
            <ExploreApp
              icon={InfoCircleOutlined}
              name={translate(translations.faqs)}
            />
          </LinkExternal>
          <LinkExternal to="https://minisatoshi.cash/ecosystem" inAppBrowser>
            <ExploreApp
              icon={GlobalOutlined}
              name={translate(translations.ecosystem)}
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
