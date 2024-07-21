import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

export default function ExploreChronologyView() {
  return (
    <div>
      <div>Explore Chronology View</div>

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
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold">ABLA</span>
              <span className={"text text-zinc-200 pt-0 mt-2 pb-2"}>15th May 2024</span>
            </div>
            <span className="text-md text-white-800 pt-4">Adjustable Blocksize Limit Algorithm</span>
          </div>
          <div>
            <span className={"text pt-0 mt-0"}>BCH's 32 MB blocksize limit replaced with a new adjustable limit that responds intelligently to network traffic.</span>
          </div>
          <div className={"pb-1"}>
            <span className={"text pt-0 mt-0"}>Upgrade was celebrated live in Ljubljana, Slovenia at BCH BLISS.</span>
          </div>
          <hr />
          <br />
          <hr />
          <div className="flex justify-between" >
            <span className={"text text-zinc-200 pt-0 mt-2 pb-2"}>Protocol Upgrade (Hard Fork)</span>
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
