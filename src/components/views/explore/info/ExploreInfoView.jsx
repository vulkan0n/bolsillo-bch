import {
  InfoCircleOutlined,
  LikeOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import SeleneLogo from "@/atoms/SeleneLogo";
import ExploreApp from "@/views/explore/ExploreApp";
import LinkExternal from "@/atoms/LinkExternal";

import { translate } from "@/util/translations";
import translations from "@/views/explore/translations";

export default function ExploreInfoView() {
  return (
    <>
      <div className="flex justify-center items-center text-xl font-bold py-2">
        <SeleneLogo className="w-12 mr-1" /> {translate(translations.info)}
      </div>
      <div className="flex flex-col gap-2 px-1">
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
    </>
  );
}
