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
          <p>2011</p>
        </div>

        <VerticalTimelineElement
          contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff', paddingTop: 2 }}
          contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
          iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          icon={null}
        >
          <p className={"bg-zinc-500 pt-0 mt-0"}>My own custom text</p>
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
