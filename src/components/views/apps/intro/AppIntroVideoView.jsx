import { PlayCircleOutlined } from "@ant-design/icons";

import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Card from "@/atoms/Card";
import EmbeddedVideo from "@/atoms/EmbeddedVideo";

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
        <Card className="p-2">
          <EmbeddedVideo url={INTRODUCTION_VIDEO_URL} />
        </Card>
      </div>
    </FullColumn>
  );
}
