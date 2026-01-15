import {
  LikeOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  PlayCircleOutlined,
  MailOutlined,
  XOutlined,
} from "@ant-design/icons";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import ExploreApp from "@/views/explore/ExploreApp";
import { TelegramFilled } from "@/atoms/icons/TelegramFilled";
import Card from "@/atoms/Card";
import EmbeddedVideo from "@/atoms/EmbeddedVideo";
import SeleneLogo from "@/atoms/SeleneLogo";
import { translate } from "@/util/translations";
import translations from "./translations";

const INTRODUCTION_VIDEO_URL = "https://youtu.be/AYE6dbuttr8";

export default function AppIntroVideoView() {
  return (
    <FullColumn>
      <ViewHeader
        title={translate(translations.introductionVideo)}
        icon={PlayCircleOutlined}
        close="/explore"
      />
      <div className="flex flex-col gap-2 p-1.5">
        <Card>
          <EmbeddedVideo url={INTRODUCTION_VIDEO_URL} />
        </Card>
        <Card>
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-xl font-bold">
              <SeleneLogo className="w-12 mr-1" />
              <span>Need Help?</span>
            </div>
            <ExploreApp
              icon={TelegramFilled}
              name={translations.telegram}
              to="https://t.me/SeleneWallet"
              external
            />
            <ExploreApp
              icon={MailOutlined}
              name={translations.email}
              to="mailto:support@selene.cash"
              external
            />
            <ExploreApp
              icon={GlobalOutlined}
              name={translations.website}
              to="https://selene.cash"
              external
            />
            <ExploreApp
              icon={XOutlined}
              name={translations.xtwitter}
              to="https://x.com/SeleneWallet"
              external
            />
          </div>
        </Card>
      </div>
    </FullColumn>
  );
}
