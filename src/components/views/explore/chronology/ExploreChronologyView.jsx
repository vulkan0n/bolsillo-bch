import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import {
  ProfileOutlined,
} from "@ant-design/icons";
import AppHero from '@/components/atoms/AppHero/AppHero';
import EmbeddedVideo from '../../../atoms/EmbeddedVideo/EmbeddedVideo';

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0"
const ABLA_FAQ_URL = "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize"

const CATEGORIES = {
  HARD_FORK: "Protocol Upgrade (Hard Fork)"
}

const TIMELINE_ITEMS = [
  {
    title: "ABLA",
    date: "15th May 2024",
    subtitle: "Adjustable Blocksize Limit Algorithm",
    category: CATEGORIES.HARD_FORK,
    videoUrl: ABLA_EXPLAINER_VIDEO_URL,
    description: [
      "BCH's 32 MB blocksize limit replaced with a new adjustable limit that scales with and responds intelligently to live network traffic.",
      "Upgrade was celebrated at BCH BLISS in Ljubljana, Slovenia."
    ],
    readMoreUrl: ABLA_FAQ_URL
  }
]

export default function ExploreChronologyView() {
  return (
    <div>
      <AppHero
        title="Chronology"
        description="Explore the history of BCH upgrades, apps, conferences & historical events."
        icon={<ProfileOutlined className="text-xl my-auto text-zinc-200" />}
      />

      <VerticalTimeline
        lineColor={'black'}
        layout={'1-column-left'}
      >
        {TIMELINE_ITEMS.map(({ title, date, subtitle, category, videoUrl, description, readMoreUrl }) => (
          <VerticalTimelineElement
            contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff', paddingTop: 0, paddingBottom: 0 }}
            contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
            iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
            icon={null}
          >
            <div className="pb-1" >
              <div className="flex justify-between items-center pt-1">
                <span className="text-xl font-bold">{title}</span>
                <span className={"text text-zinc-200 pt-0 mt-2 pb-2"}>{date}</span>
              </div>
              <span className="text-md text-white-800 pt-4">{subtitle}</span>
            </div>
            <div className="flex justify-between" >
              <span className={"text text-zinc-200 pb-2"}>{category}</span>
            </div>

            {videoUrl && <EmbeddedVideo url={ABLA_EXPLAINER_VIDEO_URL} />}

            {description && description.map(text => <div className={"py-1"}>
              <span className={"text italic"}>{text}</span>
            </div>)}

            {readMoreUrl && <div>
              <a
                href={readMoreUrl}
                target="_blank"
                className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
              >
                Read More
              </a>
            </div>}
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div >
  );
}
