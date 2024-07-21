import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import {
  ProfileOutlined,
} from "@ant-design/icons";
import AppHero from '@/components/atoms/AppHero/AppHero';
import EmbeddedVideo from '../../../atoms/EmbeddedVideo/EmbeddedVideo';

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0"
const ABLA_FAQ_URL = "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize"

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
        <div className={"pl-10"}>
          <p>2024</p>
        </div>

        <VerticalTimelineElement
          contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff', paddingTop: 0, paddingBottom: 0 }}
          contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          icon={null}
        >
          <div className="pb-1" >
            <div className="flex justify-between items-center pt-1">
              <span className="text-xl font-bold">ABLA</span>
              <span className={"text text-zinc-200 pt-0 mt-2 pb-2"}>15th May 2024</span>
            </div>
            <span className="text-md text-white-800 pt-4">Adjustable Blocksize Limit Algorithm</span>
          </div>
          <div className="flex justify-between" >
            <span className={"text text-zinc-200 pb-2"}>Protocol Upgrade (Hard Fork)</span>
          </div>

          <EmbeddedVideo url={ABLA_EXPLAINER_VIDEO_URL} />
          <div className={"py-1"}>
            <span className={"text italic"}>BCH's 32 MB blocksize limit replaced with a new adjustable limit that responds intelligently to network traffic.</span>
          </div>
          <div className={"py-1"}>
            <span className={"text italic"}>Upgrade was celebrated live in Ljubljana, Slovenia at BCH BLISS.</span>
          </div>

          <div>
            <a
              href={ABLA_FAQ_URL}
              target="_blank"
              className="flex justify-center m-1 rounded-full border border-2 border-primary bg-primary text-zinc-100 shadow-md opacity-90"
            >
              Read More
            </a>
          </div>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          date="2010 - 2011"
          contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          icon={null}
        >
          <h3 className="vertical-timeline-element-title">Art Director</h3>
          <h4 className="vertical-timeline-element-subtitle">San Francisco, CA</h4>
          <p>
            Creative Direction, User Experience, Visual Design, SEO, Online Marketing
          </p>
        </VerticalTimelineElement>
      </VerticalTimeline>

    </div>
  );
}
